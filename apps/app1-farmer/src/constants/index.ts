export const API_BASE_URL = 'https://api.ekatale.com/v1';

export const API_ROUTES = {
  AUTH_REQUEST_OTP: '/auth/otp/request',
  AUTH_VERIFY_OTP: '/auth/otp/verify',
  AUTH_REFRESH_TOKEN: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/me',
  FARMER_PROFILE: '/farmers/me',
  FARMER_LISTINGS: '/farmer/listings',
  FARMER_LISTING_CREATE: '/farmer/listings',
  FARMER_LISTING_BY_ID: (id: string) => `/farmer/listings/${id}`,
  FARMER_AI_DIAGNOSE: '/farmer/listings/diagnose',
  PRICE_CHECK: '/prices',
  PRICE_FORECAST: '/prices/forecast',
  PAYMENT_HISTORY: '/payments',
  WALLET_BALANCE: '/wallet',
  TRANSPORT_JOBS: '/transport/jobs',
  TRANSPORT_JOB_BY_ID: (id: string) => `/transport/jobs/${id}`,
  DRIVER_LOCATION: (id: string) => `/transport/jobs/${id}/driver-location`,
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_MARK_READ: (id: string) => `/notifications/${id}/read`,
  PUSH_TOKEN_REGISTER: '/notifications/push-token',
  AI_CHAT: '/ai/chat',
  AI_CHAT_HISTORY: '/ai/chat/history',
} as const;

export const BUSINESS_RULES = {
  PRICE_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
} as const;

export const DB_TABLES = {
  PENDING_LISTINGS: 'pending_listings',
  CACHED_PRICES: 'cached_prices',
  CACHED_ORDERS: 'cached_orders',
  CHAT_HISTORY: 'chat_history',
  SYNC_QUEUE: 'sync_queue',
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'lg', 'sw', 'rn'] as const;

export const CROP_IDS = [
  'maize', 'beans', 'cassava', 'matooke',
  'sweet_potato', 'vegetables', 'tomatoes',
  'groundnuts', 'sorghum', 'coffee', 'fruits',
] as const;

export const DISTRICTS_MVP = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Masaka',
  'Mbarara',
  'Gulu',
  'Lira',
  'Mbale',
  'Fort Portal',
] as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ekatale/auth_token',
  USER: '@ekatale/user',
  OFFLINE_QUEUE: '@ekatale/offline_queue',
  LANGUAGE: '@ekatale/language',
} as const;
