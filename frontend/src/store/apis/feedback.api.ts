import { createApi } from '@reduxjs/toolkit/query/react';
import type { CreateFeedbackPayload, CreateFeedbackResponse } from '@/types/feedback.type';
import { authBaseQuery } from './authBaseQuery';

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
  baseQuery: authBaseQuery,
  endpoints: (builder) => ({
    createFeedback: builder.mutation<CreateFeedbackResponse, CreateFeedbackPayload>({
      query: (body) => ({
        url: '/feedback',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateFeedbackMutation } = feedbackApi;