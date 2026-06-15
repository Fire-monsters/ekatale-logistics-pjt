import { API_BASE_URL } from '../constants';

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error?: string; message?: string };

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    typeof (payload as { success?: unknown }).success === 'boolean'
  );
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await res.json().catch(() => undefined);

  if (!res.ok) {
    const err = payload as { error?: string; message?: string } | undefined;
    throw new Error(err?.error ?? err?.message ?? `HTTP ${res.status}`);
  }

  if (isApiEnvelope<T>(payload)) {
    if (!payload.success) {
      throw new Error(payload.error ?? payload.message ?? 'REQUEST_FAILED');
    }
    return payload.data;
  }

  return payload as T;
}

export function get<T>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, { ...options, method: options?.method ?? 'GET' });
}

export function post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function patch<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

export function del<T>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}
