import { get, post, patch, del } from './client';
import { API_ROUTES } from '../constants';
import type { ProduceListing, PriceGuidance, Payment, TransportJob } from '../types';

// ─────────────────────────────────────────────
// LISTING API
// ─────────────────────────────────────────────

export const listingApi = {
  getMyListings: () => get<ProduceListing[]>(API_ROUTES.FARMER_LISTINGS),

  getById: (id: string) => get<ProduceListing>(API_ROUTES.FARMER_LISTING_BY_ID(id)),

  create: (data: Partial<ProduceListing>) =>
    post<ProduceListing>(API_ROUTES.FARMER_LISTING_CREATE, data),

  uploadPhoto: async (listingId: string, photoUri: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `crop_${Date.now()}.jpg`,
    } as any);
    return post<{ url: string }>(`/api/listings/${listingId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  runAIDiagnosis: (listingId: string) =>
    post<{ score: number; diseaseFlag: boolean; report: unknown }>(
      API_ROUTES.FARMER_AI_DIAGNOSE,
      { listingId },
    ),

  delete: (id: string) => del<void>(`${API_ROUTES.FARMER_LISTINGS}/${id}`),
};

// ─────────────────────────────────────────────
// PRICE API
// ─────────────────────────────────────────────

export const priceApi = {
  getPrices: (params?: { commodities?: string; region?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return get<PriceGuidance[]>(`${API_ROUTES.PRICE_CHECK}${qs}`);
  },

  getForecast: (commodityId: string, regionId: string) =>
    get<{ forecast14d: { date: string; price: number }[] }>(
      `${API_ROUTES.PRICE_FORECAST}?commodity=${commodityId}&region=${regionId}`,
    ),
};

// ─────────────────────────────────────────────
// PAYMENT API
// ─────────────────────────────────────────────

export const paymentApi = {
  getHistory: (params?: { page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return get<Payment[]>(`${API_ROUTES.PAYMENT_HISTORY}${qs}`);
  },

  getWalletBalance: () =>
    get<{ balance: number; loyaltyPoints: number }>(API_ROUTES.WALLET_BALANCE),
};

// ─────────────────────────────────────────────
// TRANSPORT API
// ─────────────────────────────────────────────

export const transportApi = {
  getActiveJob: (jobId: string) =>
    get<TransportJob>(API_ROUTES.TRANSPORT_JOB_BY_ID(jobId)),

  getDriverLocation: (jobId: string) =>
    get<{ lat: number; lng: number; updatedAt: string }>(API_ROUTES.DRIVER_LOCATION(jobId)),

  getMyJobs: () => get<TransportJob[]>(API_ROUTES.TRANSPORT_JOBS),

  updateJobStatus: (jobId: string, status: string, otp?: string) =>
    patch<TransportJob>(API_ROUTES.TRANSPORT_JOB_BY_ID(jobId), { status, otp }),
};

// ─────────────────────────────────────────────
// NOTIFICATION API
// ─────────────────────────────────────────────

export const notificationApi = {
  getAll: () => get(API_ROUTES.NOTIFICATIONS),

  markRead: (id: string) => patch(API_ROUTES.NOTIFICATION_MARK_READ(id)),

  registerPushToken: (token: string, platform: 'android' | 'ios') =>
    post(API_ROUTES.PUSH_TOKEN_REGISTER, { token, platform }),
};

// ─────────────────────────────────────────────
// AI CHATBOT API
// ─────────────────────────────────────────────

export const aiApi = {
  sendMessage: (message: string, context?: { cropType?: string; language?: string }) =>
    post<{ reply: string; suggestions?: string[] }>(API_ROUTES.AI_CHAT, {
      message,
      ...context,
    }),

  getChatHistory: () => get<{ id: string; role: 'user' | 'ai'; content: string; ts: string }[]>(
    API_ROUTES.AI_CHAT_HISTORY,
  ),
};
