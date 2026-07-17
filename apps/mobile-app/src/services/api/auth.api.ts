// apps/app1-farmer/src/services/api/auth.api.ts
import { get, post } from './client';
import { API_ROUTES } from '../../constants';
import type { User } from '../../types';

// ── Request / Response shapes ────────────────────────────────────────────────

export interface RequestOtpPayload {
  phone:   string;
  purpose: 'register' | 'login';
  role?:   string;
}

export interface VerifyOtpPayload {
  phone:   string;
  code:    string;
  purpose: 'register' | 'login';
}

export interface VerifyOtpResponse {
  verified: boolean;
  phone:    string;
}

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

export interface RegisterUserPayload {
  phone:        string;
  fullName:     string;
  role:         'farmer' | 'village_agent' | 'consumer';
  password:     string;
  languagePref?: string;
  // Farmer fields
  district?:         string;
  village?:          string;
  farmSizeAcres?:    number;
  cropsGrown?:       string[];
  paymentProvider?:  'mtn' | 'airtel';
  paymentNumber?:    string;
  gpsLat?:           number;
  gpsLng?:           number;
  nin?:              string;
  // Village-agent fields
  territoryDistrict?: string;
  territoryVillages?: string[];
}

export interface LoginWithPasswordPayload {
  phone:    string;
  password: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

export const authApi = {
  /** Request OTP (send SMS) */
  requestOtp: (payload: RequestOtpPayload) =>
    post<{ message: string }>(API_ROUTES.AUTH_REQUEST_OTP, payload),

  /** Verify 6-digit OTP code */
  verifyOtp: (payload: VerifyOtpPayload) =>
    post<VerifyOtpResponse>(API_ROUTES.AUTH_VERIFY_OTP, payload),

  /**
   * Register new user — creates account + profile.
   * OTP is sent separately via requestOtp after this succeeds.
   */
  registerUser: (payload: RegisterUserPayload) =>
    post<{ message: string }>(API_ROUTES.AUTH_REGISTER, payload),

  /**
   * Login with phone + password.
   * Returns success if credentials match — OTP is sent next for 2FA.
   */
  loginWithPassword: (payload: LoginWithPasswordPayload) =>
    post<{ message: string }>(API_ROUTES.AUTH_LOGIN_PASSWORD, payload),

  /** Full login — called after OTP verified, returns tokens */
  login: (phone: string) =>
    post<AuthSessionResponse>(API_ROUTES.AUTH_LOGIN, { phone }),

  /** Refresh access token */
  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }>(API_ROUTES.AUTH_REFRESH_TOKEN, { refreshToken }),

  /** Logout — revoke refresh token */
  logout: (refreshToken: string) =>
    post<{ message: string }>(API_ROUTES.AUTH_LOGOUT, { refreshToken }),

  /** Get authenticated user profile */
  getProfile: () =>
    get<User>(API_ROUTES.AUTH_PROFILE),

    /**
   * Upload profile photo — mirrors listingApi.uploadPhotos pattern.
   * uri is a local file:// URI from the image picker.
   */
  uploadProfilePhoto: (uri: string) => {
    const formData = new FormData()
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: `profile_${Date.now()}.jpg`,
    } as any)
    return post<User>(API_ROUTES.AUTH_UPLOAD_PHOTO, formData)
  },
};
