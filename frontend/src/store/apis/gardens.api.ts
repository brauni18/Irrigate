import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  ApiGarden,
  DeleteGardenResponse,
  GardenMutationBody,
  GardenPhotoUploadUrlResponse,
  RequestGardenPhotoUploadUrlPayload,
  UpdateGardenPayload,
} from '@/types/garden.type';
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
    requestGardenPhotoUploadUrl: builder.mutation<
      GardenPhotoUploadUrlResponse,
      RequestGardenPhotoUploadUrlPayload
    >({
      query: (body) => ({
        url: '/uploads/gardens/photo-url',
        method: 'POST',
        body,
      }),
    }),
    createGarden: builder.mutation<ApiGarden, GardenMutationBody>({
      query: (body) => ({
        url: '/gardens',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Garden'],
    }),
    updateGarden: builder.mutation<ApiGarden, UpdateGardenPayload>({
      query: ({ id, body }) => ({
        url: `/gardens/${id}`,
        method: 'PATCH',
        body,
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
  useRequestGardenPhotoUploadUrlMutation,
  useCreateGardenMutation,
  useUpdateGardenMutation,
  useDeleteGardenMutation,
} = gardensApi;
