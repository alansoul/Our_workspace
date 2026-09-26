import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://workspace-api-xjdz.onrender.com/api';

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = Cookies.get('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    // 👈 REQUIRED: Tells the browser to send & receive HttpOnly cookies across origins
    credentials: 'include',
    ...options,
    headers,
  });

  const data: Record<string, unknown> = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    // Handles NestJS ValidationPipe errors (which return an array of strings) as well as single string errors
    const message = Array.isArray(data['message'])
      ? data['message'].join(', ')
      : typeof data['message'] === 'string'
      ? data['message']
      : `API Error: ${res.status}`;

    throw new Error(message);
  }

  return data as T;
}