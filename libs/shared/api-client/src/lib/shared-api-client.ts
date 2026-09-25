import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://workspace-api-xjdz.onrender.com/api';

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = Cookies.get('token');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data: Record<string, unknown> = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const message = typeof data['message'] === 'string' ? data['message'] : `API Error: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}