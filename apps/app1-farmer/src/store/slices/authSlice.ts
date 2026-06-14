// apps/app1-farmer/src/store/slices/authSlice.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@constants/index';
import type { User } from '../../types';
import type { RootState } from '../index';
import { authApi } from '../../services/api/auth.api';
import type { RegisterUserPayload } from '../../services/api/auth.api';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthTokens { accessToken: string; refreshToken: string }

/** Accumulated registration form data across multi-screen flow */
export interface RegistrationDraft {
  role:              'farmer' | 'village_agent' | null;
  // Farmer details (FarmerDetailsScreen)
  fullName?:         string;
  nin?:              string;
  district?:         string;
  village?:          string;
  farmSizeAcres?:    number;
  cropsGrown?:       string[];
  gpsLat?:           number;
  gpsLng?:           number;
  // Agent details (AgentDetailsScreen)
  territoryDistrict?: string;
  territoryVillages?: string[];
  // Phone + password (PhonePasswordScreen)
  phone?:            string;
  countryCode?:      string;
  paymentProvider?:  'mtn' | 'airtel';
  paymentNumber?:    string;
}

interface AuthState {
  user:              User | null;
  tokens:            AuthTokens | null;
  isAuthenticated:   boolean;
  isLoading:         boolean;
  error:             string | null;
  /** Phone stored when OTP is sent so verify always uses the same value */
  pendingPhone:      string | null;
  /** 'register' | 'login' */
  pendingPurpose:    'register' | 'login' | null;
  /** Accumulated registration data across screens */
  registrationDraft: RegistrationDraft;
}

const initialDraft: RegistrationDraft = { role: null };

const initialState: AuthState = {
  user:              null,
  tokens:            null,
  isAuthenticated:   false,
  isLoading:         false,
  error:             null,
  pendingPhone:      null,
  pendingPurpose:    null,
  registrationDraft: initialDraft,
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

/**
 * REGISTRATION — final step
 * Called from PhonePasswordScreen after all details (farmer/agent) collected.
 * 1. Creates the account (server validates the full payload).
 * 2. Triggers an OTP to the registered phone via Africa's Talking
 *    (backend sendOtpSms — AT credentials are read from .env, used in all envs).
 */
export const registerAndSendOtp = createAsyncThunk(
  'auth/registerAndSendOtp',
  async (payload: RegisterUserPayload, { rejectWithValue }) => {
    try {
      // 1. Register account (creates user + role profile, returns success)
      await authApi.registerUser(payload);
      // 2. Request OTP to verify phone (sent via Africa's Talking)
      await authApi.requestOtp({
        phone:   payload.phone,
        purpose: 'register',
        role:    payload.role,
      });
      return { phone: payload.phone };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Registration failed');
    }
  },
);

/**
 * OTP VERIFY — After registration OTP
 * Verifies code → logs user in automatically
 */
export const verifyRegistrationOtp = createAsyncThunk(
  'auth/verifyRegistrationOtp',
  async (payload: { code: string }, { rejectWithValue, getState }) => {
    try {
      const { pendingPhone } = (getState() as RootState).auth;
      if (!pendingPhone) {
        return rejectWithValue('Session expired. Please restart registration.');
      }
      const verified = await authApi.verifyOtp({
        phone:   pendingPhone,
        code:    payload.code,
        purpose: 'register',
      });
      if (!verified.verified) throw new Error('INVALID_OR_EXPIRED_OTP');

      // Auto-login after successful verification
      const session = await authApi.login(pendingPhone);
      await persistTokens(session.accessToken, session.refreshToken);
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Invalid or expired code');
    }
  },
);

/**
 * LOGIN — Phone + password, then OTP
 * Step 1: validate credentials, send OTP (via Africa's Talking)
 */
export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async (
    payload: { phone: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      await authApi.loginWithPassword(payload);
      await authApi.requestOtp({ phone: payload.phone, purpose: 'login' });
      return { phone: payload.phone };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Login failed');
    }
  },
);

/**
 * LOGIN OTP VERIFY — Step 2 of login
 */
export const verifyLoginOtp = createAsyncThunk(
  'auth/verifyLoginOtp',
  async (payload: { code: string }, { rejectWithValue, getState }) => {
    try {
      const { pendingPhone } = (getState() as RootState).auth;
      if (!pendingPhone) {
        return rejectWithValue('Session expired. Please log in again.');
      }
      const verified = await authApi.verifyOtp({
        phone:   pendingPhone,
        code:    payload.code,
        purpose: 'login',
      });
      if (!verified.verified) throw new Error('INVALID_OR_EXPIRED_OTP');

      const session = await authApi.login(pendingPhone);
      await persistTokens(session.accessToken, session.refreshToken);
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Invalid or expired code');
    }
  },
);

// Shared handler for both verify thunks' fulfilled state
function applySession(
  state: AuthState,
  session: { user: { userId: string; phone: string; fullName: string; role: string; languagePref?: string }; accessToken: string; refreshToken: string },
) {
  const { user, accessToken, refreshToken } = session;
  state.user = {
    id:       user.userId,
    phone:    user.phone,
    role:     user.role as any,
    fullName: user.fullName,
    language: (user.languagePref ?? 'en') as any,
  };
  state.tokens          = { accessToken, refreshToken };
  state.isAuthenticated = true;
  state.pendingPhone    = null;
  state.pendingPurpose  = null;
}

/** Cold start — restore session from AsyncStorage */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      const user = await authApi.getProfile();
      return { user, accessToken: token };
    } catch {
      await clearTokens();
      return null;
    }
  },
);

/** Logout */
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (_, { getState }) => {
    try {
      const tokens = (getState() as RootState).auth.tokens;
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch {
      // Always clear local state
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
    /** Update any fields of the registration draft (called from each screen) */
    updateRegistrationDraft(state, action: PayloadAction<Partial<RegistrationDraft>>) {
      state.registrationDraft = {
        ...state.registrationDraft,
        ...action.payload,
      };
    },
    /** Clear draft on successful registration or when user cancels */
    clearRegistrationDraft(state) {
      state.registrationDraft = initialDraft;
    },
    loggedOut() {
      return { ...initialState };
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {

    // ── registerAndSendOtp ────────────────────────────────────────────────────
    builder
      .addCase(registerAndSendOtp.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(registerAndSendOtp.fulfilled, (s, a) => {
        s.isLoading      = false;
        s.pendingPhone   = a.payload.phone;
        s.pendingPurpose = 'register';
      })
      .addCase(registerAndSendOtp.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });

    // ── verifyRegistrationOtp ─────────────────────────────────────────────────
    builder
      .addCase(verifyRegistrationOtp.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (s, a) => {
        s.isLoading = false;
        applySession(s, a.payload as any);
        s.registrationDraft = initialDraft;
      })
      .addCase(verifyRegistrationOtp.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });

    // ── loginWithCredentials ──────────────────────────────────────────────────
    builder
      .addCase(loginWithCredentials.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(loginWithCredentials.fulfilled, (s, a) => {
        s.isLoading      = false;
        s.pendingPhone   = a.payload.phone;
        s.pendingPurpose = 'login';
      })
      .addCase(loginWithCredentials.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });

    // ── verifyLoginOtp ────────────────────────────────────────────────────────
    builder
      .addCase(verifyLoginOtp.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (s, a) => {
        s.isLoading = false;
        applySession(s, a.payload as any);
      })
      .addCase(verifyLoginOtp.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });

    // ── restoreSession ────────────────────────────────────────────────────────
    builder.addCase(restoreSession.fulfilled, (s, a) => {
      if (a.payload) {
        s.user            = a.payload.user as any;
        s.tokens          = { accessToken: a.payload.accessToken, refreshToken: '' };
        s.isAuthenticated = true;
      }
    });

    // ── logoutThunk ───────────────────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, () => ({ ...initialState }));
  },
});

export const {
  updateRegistrationDraft,
  clearRegistrationDraft,
  loggedOut,
  clearError,
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated    = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthUser           = (s: RootState) => s.auth.user;
export const selectAuthLoading        = (s: RootState) => s.auth.isLoading;
export const selectAuthError          = (s: RootState) => s.auth.error;
export const selectPendingPhone       = (s: RootState) => s.auth.pendingPhone;
export const selectPendingPurpose     = (s: RootState) => s.auth.pendingPurpose;
export const selectRegistrationDraft  = (s: RootState) => s.auth.registrationDraft;
export const selectUserRole           = (s: RootState) => s.auth.user?.role ?? null;

export default authSlice.reducer;