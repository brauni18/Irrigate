import { createApi } from '@reduxjs/toolkit/query/react';
import type { ApiGarden, DeleteGardenResponse, UpdateGardenPayload } from '@/types/garden.type';
import { authBaseQuery } from './authBaseQuery';

export type { ApiGarden } from '@/types/garden.type';

export const gardensApi = createApi({
  reducerPath: 'gardensApi',
  baseQuery: authBaseQuery,
  tagTypes: ['Garden'],
  endpoints: (builder) => ({
    listGardens: builder.query<ApiGarden[], void>({
      query: () => '/gardens',
      providesTags: ['Garden'],
    }),
    getGarden: builder.query<ApiGarden, string>({
      query: (id) => `/gardens/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Garden', id }],
    }),
    createGarden: builder.mutation<ApiGarden, FormData>({
      query: (formData) => ({
        url: '/gardens',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Garden'],
    }),
    updateGarden: builder.mutation<ApiGarden, UpdateGardenPayload>({
      query: ({ id, formData }) => ({
        url: `/gardens/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Garden'],
    }),
    deleteGarden: builder.mutation<DeleteGardenResponse, string>({
      query: (id) => ({
        url: `/gardens/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Garden'],
    }),
  }),
});

export const {
  useListGardensQuery,
  useGetGardenQuery,
  useCreateGardenMutation,
  useUpdateGardenMutation,
  useDeleteGardenMutation,
} = gardensApi;
