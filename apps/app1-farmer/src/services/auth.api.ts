import { get, post } from './client';
import { API_ROUTES } from '../constants';
import type { AuthTokens, User } from '../types';

export interface RequestOtpPayload {
  phone: string;
  countryCode: string;
}

export interface VerifyOtpPayload {
  phone: string;
  countryCode: string;
  otp: string;
}

export interface VerifyOtpResponse {
  tokens: AuthTokens;
  user: User;
  isNewUser: boolean;
}

export interface RegisterFarmerPayload {
  fullName: string;
  nin: string;
  district: string;
  village?: string;
  farmSizeAcres: number;
  crops: string[];
  paymentProvider: 'MTN_MOMO' | 'AIRTEL_MONEY';
  paymentNumber: string;
  gpsLat?: number;
  gpsLng?: number;
}

export const authApi = {
  requestOtp: (payload: RequestOtpPayload) =>
    post<{ message: string; expiresIn: number }>(API_ROUTES.AUTH_REQUEST_OTP, payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    post<VerifyOtpResponse>(API_ROUTES.AUTH_VERIFY_OTP, payload),

  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }>(API_ROUTES.AUTH_REFRESH_TOKEN, { refreshToken }),

  logout: () => post<void>(API_ROUTES.AUTH_LOGOUT),

  getProfile: () => get<User>(API_ROUTES.AUTH_PROFILE),

  registerFarmer: (payload: RegisterFarmerPayload) =>
    post<{ user: User; farmerProfile: unknown }>('/api/users/register/farmer', payload),
};
