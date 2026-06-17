// apps/app1-farmer/src/services/client.ts
import { AUTH_API_BASE_URL } from '../constants';
import { get as _get, post as _post, patch as _patch, del as _del, apiRequest, ApiError } from './api/httpClient';

export { ApiError };

/**
 * @deprecated Thin wrappers kept so existing imports (authSlice, agent.ts)
 * keep working unchanged. New code should call the per-service clients in
 * services/api/* directly (listing.api.ts, price.api.ts, notification.api.ts)
 * which target listing-service / notification-service instead of auth-service.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(AUTH_API_BASE_URL, endpoint, options);
}

export function get<T>(endpoint: string, options?: RequestInit) {
  return _get<T>(AUTH_API_BASE_URL, endpoint, options);
}

export function post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return _post<T>(AUTH_API_BASE_URL, endpoint, body, options);
}

export function patch<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return _patch<T>(AUTH_API_BASE_URL, endpoint, body, options);
}

export function del<T>(endpoint: string, options?: RequestInit) {
  return _del<T>(AUTH_API_BASE_URL, endpoint, options);
}