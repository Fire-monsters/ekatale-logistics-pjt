// src/store/slices/authSlice.ts
// REPLACE the entire file

import AsyncStorage           from '@react-native-async-storage/async-storage';
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
}                             from '@reduxjs/toolkit';
import { STORAGE_KEYS }       from '@constants/index';
import type { AuthTokens, User } from '../types';
import type { RootState }     from '../index';
import { authApi }            from '../services/auth.api';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  phone:                string | null;
  user:                 User | null;
  tokens:               AuthTokens | null;
  isAuthenticated:      boolean;
  isLoading:            boolean;
  error:                string | null;
  // Holds verified phone+role before profile is complete
  pendingPhone:         string | null;
  pendingRole:          string | null;
  // True when OTP has been verified, awaiting profile completion
  otpVerified:          boolean;
}

const initialState: AuthState = {
  phone:           null,
  user:            null,
  tokens:          null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
  pendingPhone:    null,
  pendingRole:     null,
  otpVerified:     false,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Step 1: Request OTP
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (
    payload: { phone: string; purpose: 'register' | 'login' },
    { rejectWithValue }
  ) => {
    try {
      return await authApi.requestOtp({
        phone:       payload.phone,
        countryCode: '256',
      });
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to send OTP');
    }
  }
);

// Step 2: Verify OTP — returns isNewUser flag
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { phone: string; otp: string; countryCode: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await authApi.verifyOtp(payload);
      // Persist tokens immediately
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        result.tokens.accessToken
      );
      return result; // { tokens, user, isNewUser }
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Invalid or expired OTP');
    }
  }
);

// Step 3: Complete farmer registration
export const completeFarmerRegistration = createAsyncThunk(
  'auth/completeFarmerRegistration',
  async (
    payload: Parameters<typeof authApi.registerFarmer>[0],
    { rejectWithValue }
  ) => {
    try {
      return await authApi.registerFarmer(payload);
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Registration failed');
    }
  }
);

// Cold start: restore session from AsyncStorage
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      // Validate token by fetching profile
      const user = await authApi.getProfile();
      return { user, accessToken: token };
    } catch {
      // Token expired or invalid — clear it
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return null;
    }
  }
);

// Logout
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch {
      // Always logout locally even if API fails
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called when user picks their role on RoleSelectScreen
    roleSelected(
      state,
      action: PayloadAction<{ phone: string; role: string }>
    ) {
      state.pendingPhone = action.payload.phone;
      state.pendingRole  = action.payload.role;
    },
    otpRequested(state, action: PayloadAction<string>) {
      state.phone = action.payload;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>
    ) {
      state.user            = action.payload.user;
      state.tokens          = action.payload.tokens;
      state.isAuthenticated = true;
      state.pendingPhone    = null;
      state.pendingRole     = null;
      state.otpVerified     = false;
      state.error           = null;
    },
    loggedOut(state) {
      return { ...initialState };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // requestOtp
    builder
      .addCase(requestOtp.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // verifyOtp
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading   = false;
        state.otpVerified = true;
        // Returning user — log them in directly
        if (!action.payload.isNewUser) {
          state.user            = action.payload.user;
          state.tokens          = action.payload.tokens;
          state.isAuthenticated = true;
        } else {
          // New user — hold tokens until profile complete
          state.tokens = action.payload.tokens;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // completeFarmerRegistration
    builder
      .addCase(completeFarmerRegistration.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(completeFarmerRegistration.fulfilled, (state, action) => {
        state.isLoading       = false;
        state.user            = action.payload.user as User;
        state.isAuthenticated = true;
        state.pendingPhone    = null;
        state.pendingRole     = null;
        state.otpVerified     = false;
      })
      .addCase(completeFarmerRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // restoreSession
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user            = action.payload.user;
          state.isAuthenticated = true;
        }
      });

    // logout
    builder
      .addCase(logoutThunk.fulfilled, () => ({ ...initialState }));
  },
});

export const {
  roleSelected,
  otpRequested,
  loginSuccess,
  loggedOut,
  clearError,
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated =
  (s: RootState) => s.auth.isAuthenticated;
export const selectAuthUser        =
  (s: RootState) => s.auth.user;
export const selectAuthLoading     =
  (s: RootState) => s.auth.isLoading;
export const selectAuthError       =
  (s: RootState) => s.auth.error;
export const selectOtpVerified     =
  (s: RootState) => s.auth.otpVerified;
export const selectPendingRole     =
  (s: RootState) => s.auth.pendingRole;
export const selectUserRole        =
  (s: RootState) =>
    s.auth.user?.role ?? (s as any).user?.currentUser?.role;

export default authSlice.reducer;