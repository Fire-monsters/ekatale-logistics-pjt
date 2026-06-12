import { API_BASE_URL } from '../constants';

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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json();
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
