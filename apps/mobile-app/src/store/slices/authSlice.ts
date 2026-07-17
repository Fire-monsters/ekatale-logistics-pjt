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

export interface RegistrationDraft {
  role:               'farmer' | 'village_agent' | 'consumer' | null;
  fullName?:          string;
  nin?:               string;
  district?:          string;
  village?:           string;
  farmSizeAcres?:     number;
  cropsGrown?:        string[];
  gpsLat?:            number;
  gpsLng?:            number;
  territoryDistrict?: string;
  territoryVillages?: string[];
  phone?:             string;
  countryCode?:       string;
  paymentProvider?:   'mtn' | 'airtel';
  paymentNumber?:     string;
  password?:          string; // ← added: needed for register after OTP verify
  profilePhotoUri?:   string; // ← added: temp local URI of profile photo to upload during registration
}

interface AuthState {
  user:              User | null;
  tokens:            AuthTokens | null;
  isAuthenticated:   boolean;
  isLoading:         boolean;
  error:             string | null;
  pendingPhone:      string | null;
  pendingPurpose:    'register' | 'login' | null;
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
 * STEP 1 — Send OTP only (no user created yet)
 * Called from PhonePasswordScreen after all details collected.
 * Saves draft (including password) to Redux, then sends OTP.
 */
export const sendRegistrationOtp = createAsyncThunk(
  'auth/sendRegistrationOtp',
  async (payload: RegisterUserPayload, { rejectWithValue }) => {
    try {
      await authApi.requestOtp({
        phone:   payload.phone,
        purpose: 'register',
        role:    payload.role,
      });
      // Return full payload so slice can save it as draft
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to send OTP');
    }
  },
);

/**
 * STEP 2 — Verify OTP
 * Called from OTPVerifyScreen. Just verifies the code, nothing else.
 */
export const verifyRegistrationOtp = createAsyncThunk(
  'auth/verifyRegistrationOtp',
  async (payload: { code: string }, { rejectWithValue, getState }) => {
    try {
      const { pendingPhone } = (getState() as RootState).auth;
      if (!pendingPhone) {
        return rejectWithValue('Session expired. Please restart registration.');
      }
      const result = await authApi.verifyOtp({
        phone:   pendingPhone,
        code:    payload.code,
        purpose: 'register',
      });
      if (!result.verified) throw new Error('INVALID_OR_EXPIRED_OTP');
      return { verified: true };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Invalid or expired code');
    }
  },
);

/**
 * STEP 3 — Create user + issue JWT
 * Called from OTPVerifyScreen immediately after verifyRegistrationOtp succeeds.
 * Uses the draft saved in Redux — no need to pass anything in.
 */
export const completeRegistration = createAsyncThunk(
  'auth/completeRegistration',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { registrationDraft, pendingPhone } = (getState() as RootState).auth;

      if (!pendingPhone || !registrationDraft.role) {
        return rejectWithValue('Session expired. Please restart registration.');
      }

      const registerPayload: RegisterUserPayload = {
        phone:             pendingPhone,
        fullName:          registrationDraft.fullName!,
        password:          registrationDraft.password!,
        role:              registrationDraft.role,
        nin:               registrationDraft.nin,
        district:          registrationDraft.district,
        village:           registrationDraft.village,
        farmSizeAcres:     registrationDraft.farmSizeAcres,
        cropsGrown:        registrationDraft.cropsGrown,
        gpsLat:            registrationDraft.gpsLat,
        gpsLng:            registrationDraft.gpsLng,
        paymentProvider:   registrationDraft.paymentProvider,
        paymentNumber:     registrationDraft.paymentNumber,
        territoryDistrict: registrationDraft.territoryDistrict,
        territoryVillages: registrationDraft.territoryVillages,
      };

      // Step 1: create the user account
      await authApi.registerUser(registerPayload);

      // Step 2: issue JWT tokens
      const session = await authApi.login(pendingPhone);

      // Step 3: persist tokens BEFORE anything that needs auth
      await persistTokens(session.accessToken, session.refreshToken);

      // Step 4: upload profile photo (authenticated now, before applySession)
      // Non-blocking — a flaky upload must NOT lock someone out of their account.
      if (registrationDraft.profilePhotoUri) {
        try {
          await authApi.uploadProfilePhoto(registrationDraft.profilePhotoUri);
        } catch (photoErr) {
          // Log and continue — user can add photo from profile later
          console.warn('[completeRegistration] Photo upload failed:', photoErr);
        }
      }

      // Step 5: return session → reducer calls applySession → isAuthenticated = true
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Registration failed');
    }
  },
);

/**
 * RESEND OTP — re-sends without re-registering
 * Called from OTPVerifyScreen resend button.
 */
export const requestOtpOnly = createAsyncThunk(
  'auth/requestOtpOnly',
  async (
    input: { phone: string; purpose: 'register' | 'login'; role?: string },
    { rejectWithValue },
  ) => {
    try {
      await authApi.requestOtp(input);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to resend OTP');
    }
  },
);

/**
 * LOGIN STEP 1 — validate password + send OTP
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
 * LOGIN STEP 2 — verify OTP + issue JWT
 */
export const verifyLoginOtp = createAsyncThunk(
  'auth/verifyLoginOtp',
  async (payload: { code: string }, { rejectWithValue, getState }) => {
    try {
      const { pendingPhone } = (getState() as RootState).auth;
      if (!pendingPhone) {
        return rejectWithValue('Session expired. Please log in again.');
      }
      const result = await authApi.verifyOtp({
        phone:   pendingPhone,
        code:    payload.code,
        purpose: 'login',
      });
      if (!result.verified) throw new Error('INVALID_OR_EXPIRED_OTP');

      const session = await authApi.login(pendingPhone);
      await persistTokens(session.accessToken, session.refreshToken);
      return session;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Invalid or expired code');
    }
  },
);

/**
 * Cold start — restore session from AsyncStorage
 */
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

/**
 * Logout
 */
export const logoutThunk = createAsyncThunk(
  'auth/logoutThunk',
  async (_, { getState }) => {
    try {
      const tokens = (getState() as RootState).auth.tokens;
      if (tokens?.refreshToken) {
        await authApi.logout(tokens.refreshToken);
      }
    } catch {
      // Always clear local regardless
    } finally {
      await clearTokens();
    }
  },
);

// ─── Shared session apply ─────────────────────────────────────────────────────

function applySession(
  state: AuthState,
  session: {
    user: {
      userId: string; phone: string;
      fullName: string; role: string; languagePref?: string;
    };
    accessToken: string;
    refreshToken: string;
  },
) {
  state.user = {
    id:       session.user.userId,
    phone:    session.user.phone,
    role:     session.user.role as any,
    fullName: session.user.fullName,
    language: (session.user.languagePref ?? 'en') as any,
  };
  state.tokens          = {
    accessToken:  session.accessToken,
    refreshToken: session.refreshToken,
  };
  state.isAuthenticated  = true;
  state.pendingPhone     = null;
  state.pendingPurpose   = null;
  state.registrationDraft = initialDraft;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateRegistrationDraft(
      state,
      action: PayloadAction<Partial<RegistrationDraft>>,
    ) {
      state.registrationDraft = {
        ...state.registrationDraft,
        ...action.payload,
      };
    },
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

    // ── sendRegistrationOtp ───────────────────────────────────────────────────
    builder
      .addCase(sendRegistrationOtp.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(sendRegistrationOtp.fulfilled, (s, a) => {
        s.isLoading      = false;
        s.pendingPhone   = a.payload.phone;
        s.pendingPurpose = 'register';
        // Save entire payload as draft so completeRegistration can use it
        s.registrationDraft = {
          ...s.registrationDraft,
          phone:             a.payload.phone,
          password:          a.payload.password,
          fullName:          a.payload.fullName,
          role:              a.payload.role as any,
          nin:               a.payload.nin,
          district:          a.payload.district,
          village:           a.payload.village,
          farmSizeAcres:     a.payload.farmSizeAcres,
          cropsGrown:        a.payload.cropsGrown,
          gpsLat:            a.payload.gpsLat,
          gpsLng:            a.payload.gpsLng,
          paymentProvider:   a.payload.paymentProvider as any,
          paymentNumber:     a.payload.paymentNumber,
          territoryDistrict: a.payload.territoryDistrict,
          territoryVillages: a.payload.territoryVillages,
        };
      })
      .addCase(sendRegistrationOtp.rejected, (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── verifyRegistrationOtp ─────────────────────────────────────────────────
    builder
      .addCase(verifyRegistrationOtp.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (s) => {
        // Just mark OTP verified — completeRegistration fires next
        s.isLoading = false;
      })
      .addCase(verifyRegistrationOtp.rejected, (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── completeRegistration ──────────────────────────────────────────────────
    builder
      .addCase(completeRegistration.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(completeRegistration.fulfilled, (s, a) => {
        s.isLoading = false;
        applySession(s, a.payload as any);
      })
      .addCase(completeRegistration.rejected, (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
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
        s.error     = a.payload as string;
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
        s.error     = a.payload as string;
      });

    // ── requestOtpOnly ────────────────────────────────────────────────────────
    builder
      .addCase(requestOtpOnly.pending, (s) => {
        s.isLoading = true; s.error = null;
      })
      .addCase(requestOtpOnly.fulfilled, (s) => {
        s.isLoading = false;
      })
      .addCase(requestOtpOnly.rejected, (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
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

export const selectIsAuthenticated   = (s: RootState) => s.auth.isAuthenticated;
export const selectAuthUser          = (s: RootState) => s.auth.user;
export const selectAuthLoading       = (s: RootState) => s.auth.isLoading;
export const selectAuthError         = (s: RootState) => s.auth.error;
export const selectPendingPhone      = (s: RootState) => s.auth.pendingPhone;
export const selectPendingPurpose    = (s: RootState) => s.auth.pendingPurpose;
export const selectRegistrationDraft = (s: RootState) => s.auth.registrationDraft;
export const selectUserRole          = (s: RootState) => s.auth.user?.role ?? null;

export default authSlice.reducer;
