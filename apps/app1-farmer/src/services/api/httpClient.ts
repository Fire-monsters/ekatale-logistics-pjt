// apps/app1-farmer/src/services/api/httpClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Core request function shared by every service-specific API module.
 * - Reads the access token from AsyncStorage and attaches it as Bearer auth.
 * - Skips the Content-Type header for FormData (browser/RN sets the
 *   multipart boundary automatically).
 * - Throws ApiError with the parsed `{ success:false, error }` body on
 *   non-2xx responses so callers can branch on `err.body.error`.
 */
export async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.error ?? data?.message ?? `HTTP ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  // All our services wrap responses as { success, data }
  return (data?.data ?? data) as T;
}

export function get<T>(baseUrl: string, endpoint: string, options?: RequestInit) {
  return apiRequest<T>(baseUrl, endpoint, { ...options, method: 'GET' });
}

export function post<T>(baseUrl: string, endpoint: string, body?: unknown, options?: RequestInit) {
  return apiRequest<T>(baseUrl, endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function patch<T>(baseUrl: string, endpoint: string, body?: unknown, options?: RequestInit) {
  return apiRequest<T>(baseUrl, endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

export function del<T>(baseUrl: string, endpoint: string, options?: RequestInit) {
  return apiRequest<T>(baseUrl, endpoint, { ...options, method: 'DELETE' });
}