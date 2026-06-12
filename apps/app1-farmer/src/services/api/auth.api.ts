// apps/app1-farmer/src/services/auth.api.ts
import { get, post } from './client';
import { API_ROUTES } from '../../constants';
import type { User } from '../../types';

// ── Request shapes (must match backend auth.validation.ts) ──────────────────

export interface RequestOtpPayload {
  phone:   string;           // +256XXXXXXXXX
  purpose: 'register' | 'login';
  role?:   string;
}

export interface VerifyOtpPayload {
  phone:   string;
  code:    string;
  purpose: 'register' | 'login';
}

// Backend returns { verified, phone } from /otp/verify
export interface VerifyOtpResponse {
  verified: boolean;
  phone:    string;
}

// Backend returns this from /login and /register
export interface AuthSessionResponse {
  user: {
    userId:       string;
    phone:        string;
    fullName:     string;
    role:         string;
    languagePref: string;
    kycStatus:    string;
  };
  accessToken:  string;
  refreshToken: string;
}

// Unified registration payload for all roles
export interface RegisterUserPayload {
  phone:        string;           // +256XXXXXXXXX
  fullName:     string;
  role:         'farmer' | 'village_agent';
  languagePref?: string;
  // Farmer fields
  district?:        string;
  village?:         string;
  farmSizeAcres?:   number;
  cropsGrown?:      string[];
  paymentProvider?: 'mtn' | 'airtel';
  paymentNumber?:   string;
  gpsLat?:          number;
  gpsLng?:          number;
  // Village-agent fields
  territoryDistrict?: string;
  territoryVillages?: string[];
}

// ── API calls ────────────────────────────────────────────────────────────────

export const authApi = {
  /** Step 1: send OTP to phone */
  requestOtp: (payload: RequestOtpPayload) =>
    post<{ message: string }>(API_ROUTES.AUTH_REQUEST_OTP, payload),

  /** Step 2: verify 6-digit code */
  verifyOtp: (payload: VerifyOtpPayload) =>
    post<VerifyOtpResponse>(API_ROUTES.AUTH_VERIFY_OTP, payload),

  /** Login — called after OTP verified for returning users */
  login: (phone: string) =>
    post<AuthSessionResponse>(API_ROUTES.AUTH_LOGIN, { phone }),

  /** Register — called after OTP verified for new users */
  registerUser: (payload: RegisterUserPayload) =>
    post<AuthSessionResponse>(API_ROUTES.AUTH_REGISTER, payload),

  /** Refresh access token */
  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }>(API_ROUTES.AUTH_REFRESH_TOKEN, { refreshToken }),

  /** Invalidate refresh token */
  logout: (refreshToken: string) =>
    post<{ message: string }>(API_ROUTES.AUTH_LOGOUT, { refreshToken }),

  /** Get authenticated user's profile */
  getProfile: () =>
    get<User>(API_ROUTES.AUTH_PROFILE),
};