'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { apiFetch } from '@workspace/shared-api-client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName: string;
  branch?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
    universityId: string;
  };
}

export const authApi = {
  login: (dto: LoginDto): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(dto) }),

  register: (dto: RegisterDto): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(dto) }),
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAuth = async (fn: () => Promise<AuthResponse>, onSuccess?: () => void) => {
    setError('');
    setLoading(true);
    try {
      const res = await fn();
      Cookies.set('token', res.accessToken, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(res.user));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    login: (dto: LoginDto, onSuccess?: () => void) => handleAuth(() => authApi.login(dto), onSuccess),
    register: (dto: RegisterDto, onSuccess?: () => void) => handleAuth(() => authApi.register(dto), onSuccess),
    logout: (onLogout?: () => void) => {
      Cookies.remove('token');
      localStorage.removeItem('user');
      if (onLogout) {
        onLogout();
      }
    },
  };
}