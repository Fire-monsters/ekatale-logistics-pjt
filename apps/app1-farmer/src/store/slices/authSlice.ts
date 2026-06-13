// apps/app1-farmer/src/store/slices/authSlice.ts
import AsyncStorage       from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS }   from '@constants/index';
import type { User }      from '../../types';
import type { RootState } from '../index';
import { authApi }        from '../../services/api/auth.api';
import type { RegisterUserPayload } from '../../services/api/auth.api';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthTokens { accessToken: string; refreshToken: string }

interface AuthState {
  user:            User | null;
  tokens:          AuthTokens | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  /** Full phone (+256...) stored when OTP is requested so verify always uses the same value */
  pendingPhone:    string | null;
  /** 'register' | 'login' — stored when OTP is requested so verify never depends on nav params */
  pendingPurpose:  'register' | 'login' | null;
  /** Role selected on RoleSelectScreen */
  pendingRole:     'farmer' | 'village_agent' | null;
}

const initialState: AuthState = {
  user:            null,
  tokens:          null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
  pendingPhone:    null,
  pendingPurpose:  null,
  pendingRole:     null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function persistTokens(access: string, refresh: string) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN,    access],
    [STORAGE_KEYS.REFRESH_TOKEN, refresh],
  ]);
}

async function clearTokens() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
  ]);
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Step 1: request OTP — calls POST /auth/otp/request */
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (
    payload: { phone: string; purpose: 'register' | 'login'; role?: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('[requestOtp] →', { phone: payload.phone, purpose: payload.purpose });
      await authApi.requestOtp(payload);
      // Return the args so the reducer can store phone + purpose in state
      return { phone: payload.phone, purpose: payload.purpose };
    } catch (err: any) {
      console.warn('[requestOtp] ✗', err.message);
      return rejectWithValue(err.message ?? 'Failed to send OTP');
    }
  },
);

/** Step 2: verify OTP — calls POST /auth/otp/verify
 *  Purpose and phone come from Redux state (stored during requestOtp),
 *  NOT from navigation params — this prevents any param-passing bugs. */
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { code: string },
    { rejectWithValue, getState },
  ) => {
    try {
      const { pendingPhone, pendingPurpose } = (getState() as RootState).auth;

      if (!pendingPhone || !pendingPurpose) {
        return rejectWithValue('Session expired. Please re-enter your phone number.');
      }

      console.log('[verifyOtp] →', { phone: pendingPhone, purpose: pendingPurpose, code: payload.code });

      const verified = await authApi.verifyOtp({
        phone:   pendingPhone,
        code:    payload.code,
        purpose: pendingPurpose,
      } as any);

      console.log('[verifyOtp] ←', verified);

      if (!verified.verified) throw new Error('INVALID_OR_EXPIRED_OTP');

      if (pendingPurpose === 'login') {
        const session = await authApi.login(pendingPhone);
        await persistTokens(session.accessToken, session.refreshToken);
        return { mode: 'login' as const, session };
      }

      return { mode: 'register' as const, phone: pendingPhone };
    } catch (err: any) {
      console.warn('[verifyOtp] ✗', err.message);
      return rejectWithValue(err.message ?? 'Invalid or expired OTP');
    }
  },
);

/** Step 3a: complete registration (farmer or agent) */
export const completeRegistration = createAsyncThunk(
  'auth/completeRegistration',
  async (payload: RegisterUserPayload, { rejectWithValue }) => {
    try {
      const session = await authApi.registerUser(payload);
      await persistTokens(session.accessToken, session.refreshToken);
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Registration failed');
    }
  },
);

/** Cold start — restore session from AsyncStorage without requiring re-login */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      // Validate token by fetching the profile
      const user = await authApi.getProfile();
      return { user, accessToken: token };
    } catch {
      // Token expired or invalid
      await clearTokens();
      return null;
    }
  },
);

/** Logout — revoke refresh token then clear local state */
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (_, { getState }) => {
    try {
      const tokens = (getState() as RootState).auth.tokens;
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch {
      // Always clear local state even if API call fails
    } finally {
      await clearTokens();
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called from RoleSelectScreen when the user picks a role */
    roleSelected(state, action: PayloadAction<'farmer' | 'village_agent'>) {
      state.pendingRole = action.payload;
    },
    /** Convenience sync login (used by RootNavigator cold-start fallback) */
    loginSuccess(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.user            = action.payload.user;
      state.tokens          = action.payload.tokens;
      state.isAuthenticated = true;
      state.pendingPhone    = null;
      state.pendingRole     = null;
      state.error           = null;
    },
    loggedOut() {
      return { ...initialState };
    },
    clearError(state) {
      state.error = null;
    },
    otpRequested(state, action: PayloadAction<string>) {
      // kept for backward compat — stores phone for reference
      state.pendingPhone = action.payload;
      state.error        = null;
    },
  },

  extraReducers: (builder) => {

    // ── requestOtp ────────────────────────────────────────────────────────────
    builder
      .addCase(requestOtp.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(requestOtp.fulfilled, (s, a) => {
        s.isLoading      = false;
        // Store phone + purpose so verifyOtp never needs navigation params
        s.pendingPhone   = a.payload.phone;
        s.pendingPurpose = a.payload.purpose;
      })
      .addCase(requestOtp.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    // ── verifyOtp ─────────────────────────────────────────────────────────────
    builder
      .addCase(verifyOtp.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(verifyOtp.fulfilled, (s, a) => {
        s.isLoading = false;
        if (a.payload.mode === 'login') {
          const { session } = a.payload;
          s.user            = {
            id:       session.user.userId,
            phone:    session.user.phone,
            role:     session.user.role as any,
            fullName: session.user.fullName,
            language: (session.user.languagePref ?? 'en') as any,
          };
          s.tokens          = { accessToken: session.accessToken, refreshToken: session.refreshToken };
          s.isAuthenticated = true;
          s.pendingPhone    = null;
          s.pendingPurpose  = null;
        } else {
          // pendingPhone already set — keep it for the register screen
          s.pendingPurpose = null;
        }
      })
      .addCase(verifyOtp.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    // ── completeRegistration ──────────────────────────────────────────────────
    builder
      .addCase(completeRegistration.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(completeRegistration.fulfilled, (s, a) => {
        s.isLoading = false;
        const { user, accessToken, refreshToken } = a.payload;
        s.user            = {
          id:       user.userId,
          phone:    user.phone,
          role:     user.role as any,
          fullName: user.fullName,
          language: (user.languagePref ?? 'en') as any,
        };
        s.tokens          = { accessToken, refreshToken };
        s.isAuthenticated = true;
        s.pendingPhone    = null;
        s.pendingPurpose  = null;
        s.pendingRole     = null;
      })
      .addCase(completeRegistration.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    // ── restoreSession ────────────────────────────────────────────────────────
    builder
      .addCase(restoreSession.fulfilled, (s, a) => {
        if (a.payload) {
          s.user            = a.payload.user;
          s.tokens          = { accessToken: a.payload.accessToken, refreshToken: '' };
          s.isAuthenticated = true;
        }
      });

    // ── logoutThunk ───────────────────────────────────────────────────────────
    builder
      .addCase(logoutThunk.fulfilled, () => ({ ...initialState }));
  },
});

export const { roleSelected, loginSuccess, loggedOut, clearError, otpRequested } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthUser        = (s: RootState) => s.auth.user;
export const selectAuthLoading     = (s: RootState) => s.auth.isLoading;
export const selectAuthError       = (s: RootState) => s.auth.error;
export const selectPendingPhone    = (s: RootState) => s.auth.pendingPhone;
export const selectPendingPurpose  = (s: RootState) => s.auth.pendingPurpose;
export const selectPendingRole     = (s: RootState) => s.auth.pendingRole;
export const selectUserRole        = (s: RootState) =>
  s.auth.user?.role ?? (s as any).user?.currentUser?.role;

export default authSlice.reducer;