import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';

export const authBaseQuery = fetchBaseQuery({
  baseUrl: VITE_API_URL,
  prepareHeaders: (headers) => {
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem('irrigate.auth');

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { token?: string };
          token = parsed.token ?? null;
        } catch {
          token = null;
        }
      }
    }

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});