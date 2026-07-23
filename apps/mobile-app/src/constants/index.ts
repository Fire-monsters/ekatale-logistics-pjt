// apps/app1-farmer/src/constants/index.ts
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.0.27';
const DEFAULT_DEV_API_HOST = LOCAL_IP;

type ResolveApiHostOptions = {
  envHost?: string;
  debuggerHost?: string;
  extraHost?: string;
};

export function resolveApiHost(options: ResolveApiHostOptions = {}): string {
  const { envHost, debuggerHost, extraHost } = options;

  const normalizedEnvHost = envHost?.trim();
  const normalizedDebuggerHost = debuggerHost?.trim();
  const normalizedExtraHost = extraHost?.trim();

  const preferredHost = normalizedEnvHost || normalizedDebuggerHost || normalizedExtraHost || DEFAULT_DEV_API_HOST;

  if (!preferredHost) {
    return DEFAULT_DEV_API_HOST;
  }

  if (preferredHost.includes('://')) {
    return preferredHost.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  }

  return preferredHost.includes(':')
    ? preferredHost.split(':')[0]
    : preferredHost;
}

export function getDevApiHost(): string {
  const envHost = process.env.EXPO_PUBLIC_API_HOST || process.env.API_HOST;
  const debuggerHost = (globalThis as typeof globalThis & { expoConfig?: { hostUri?: string } }).expoConfig?.hostUri;
  const extraHost = process.env.EXPO_PUBLIC_API_HOST_ALT || process.env.API_HOST_ALT;

  return resolveApiHost({
    envHost,
    debuggerHost,
    extraHost,
  });
}

const DEV_API_HOST = Platform.OS === 'android' ? getDevApiHost() : getDevApiHost();

// ── Per-service base URLs ───────────────────────────────────────────────────
// Each backend service runs on its own port in dev. In production these would
// sit behind a single gateway/domain, but keeping them separate now means no
// rewrite is needed when that gateway is introduced — just change these.

export const AUTH_API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:3001/api`
  : 'https://api.ekatale.online/v1/auth';

export const LISTING_API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:3002/api`
  : 'https://api.ekatale.online/v1/listings';

export const NOTIFICATION_API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:3003/api`
  : 'https://api.ekatale.online/v1/notifications';

/** @deprecated use AUTH_API_BASE_URL — kept so existing imports don't break */
export const API_BASE_URL = AUTH_API_BASE_URL;

export const API_ROUTES = {
  AUTH_REQUEST_OTP:   '/auth/otp/request',
  AUTH_VERIFY_OTP:    '/auth/otp/verify',
  AUTH_REGISTER:      '/auth/register',
  AUTH_LOGIN:         '/auth/login',
  AUTH_LOGIN_PASSWORD:'/auth/login/password',
  AUTH_REFRESH_TOKEN: '/auth/token/refresh',
  AUTH_LOGOUT:        '/auth/logout',
  AUTH_PROFILE:       '/auth/me',
  AUTH_UPLOAD_PHOTO:  '/auth/me/photo',

  FARMER_PROFILE:          '/farmers/me',
  FARMER_LISTINGS:         '/farmer/listings',
  FARMER_LISTING_CREATE:   '/farmer/listings',
  FARMER_LISTING_BY_ID:    (id: string) => `/farmer/listings/${id}`,
  FARMER_LISTING_PHOTOS:   (id: string) => `/farmer/listings/${id}/photos`,
  FARMER_LISTING_DELETE:   (id: string) => `/farmer/listings/${id}`,
  LISTING_STATUS:          (id: string) => `/listings/${id}/status`,
  FARMER_AI_DIAGNOSE:      '/farmer/listings/diagnose',

  // Field-agent endpoints
  AGENT_SUMMARY:           '/agents/me/summary',
  AGENT_FARMERS:           '/agents/me/farmers',
  AGENT_FARMER_CREATE:     '/agents/me/farmers',
  AGENT_EARNINGS:          '/agents/me/earnings',

  // Listing-service: prices & taxonomy
  PRICE_CHECK:             '/prices',
  PRICE_FORECAST:          '/prices/forecast',
  COMMODITIES:             '/commodities',

  PAYMENT_HISTORY:         '/payments',
  WALLET_BALANCE:          '/wallet',
  TRANSPORT_JOBS:          '/transport/jobs',
  TRANSPORT_JOB_BY_ID:     (id: string) => `/transport/jobs/${id}`,
  DRIVER_LOCATION:         (id: string) => `/transport/jobs/${id}/driver-location`,

  // Notification-service
  NOTIFICATIONS:                '/notifications',
  NOTIFICATIONS_READ_ALL:       '/notifications/read-all',
  NOTIFICATION_MARK_READ:       (id: string) => `/notifications/${id}/read`,
  PUSH_TOKEN_REGISTER:          '/notifications/push-token',

  AI_CHAT:                      '/ai/chat',
  AI_CHAT_HISTORY:              '/ai/chat/history',
} as const;

export const BUSINESS_RULES = {
  PRICE_REFRESH_INTERVAL_MS: 5 * 60 * 1000,
  /** How often the offline sync engine retries the pending queue */
  SYNC_RETRY_INTERVAL_MS: 30 * 1000,
  /** Max retries before a queued action is dropped (and flagged for the user) */
  SYNC_MAX_RETRIES: 5,
} as const;

export const DB_TABLES = {
  PENDING_LISTINGS: 'pending_listings',
  CACHED_PRICES:    'cached_prices',
  CACHED_ORDERS:    'cached_orders',
  CHAT_HISTORY:     'chat_history',
  SYNC_QUEUE:       'sync_queue',
} as const;

/** Action types recognised by the offline sync engine (services/sync/offlineSync.ts) */
export const SYNC_ACTION_TYPES = {
  CREATE_LISTING:   'CREATE_LISTING',
  UPLOAD_PHOTOS:    'UPLOAD_PHOTOS',
  CANCEL_LISTING:   'CANCEL_LISTING',
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'lg', 'sw', 'rn'] as const;

export const CROP_IDS = [
  'maize', 'beans', 'cassava', 'matooke',
  'sweet_potato', 'vegetables', 'tomatoes',
  'groundnuts', 'sorghum', 'coffee', 'fruits',
] as const;

export const DISTRICTS_MVP = [
  'Kampala', 'Wakiso', 'Mukono', 'Jinja',
  'Masaka', 'Mbarara', 'Gulu', 'Lira', 'Mbale', 'Fort Portal',
] as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN:    '@ekatale/auth_token',
  REFRESH_TOKEN: '@ekatale/refresh_token',
  USER:          '@ekatale/user',
  OFFLINE_QUEUE: '@ekatale/offline_queue',
  LANGUAGE:      '@ekatale/language',
} as const;