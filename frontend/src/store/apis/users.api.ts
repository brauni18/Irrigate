import { createApi } from '@reduxjs/toolkit/query/react';
import { authBaseQuery } from './authBaseQuery';
import type { AuthResponse, AuthUser, SignupResponse } from '@/types/user.type';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: authBaseQuery,
  endpoints: (builder) => ({
    signup: builder.mutation<
      SignupResponse,
      {
        name: string;
        email: string;
        password: string;
        profession: string;
        professionOther?: string;
        businessModels: string[];
        businessModelOther?: string;
        sectors: string[];
        sectorOther?: string;
        betaConsent: boolean;
      }
    >({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    verifyEmail: builder.mutation<{ message: string }, { email: string; token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
    }),
    resendVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetMeQuery,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
} = usersApi;
