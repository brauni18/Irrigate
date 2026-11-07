import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  ApiIrrigationLine,
  CalculateIrrigationResponse,
  CalculateIrrigationRequest,
  CreateLinePayload,
  DeleteLinePayload,
  IrrigationCatalogResponse,
  UpdateLinePayload,
} from '@/types/irrigationLine.type';
import { authBaseQuery } from './authBaseQuery';

export type { ApiIrrigationLine, UpdateLinePayload, DeleteLinePayload } from '@/types/irrigationLine.type';

export const irrigationLinesApi = createApi({
  reducerPath: 'irrigationLinesApi',
  baseQuery: authBaseQuery,
  tagTypes: ['IrrigationLine'],
  endpoints: (builder) => ({
    listLines: builder.query<ApiIrrigationLine[], string>({
      query: (gardenId) => `/gardens/${gardenId}/lines`,
      providesTags: (_result, _error, gardenId) => [{ type: 'IrrigationLine', id: gardenId }],
    }),
    createLine: builder.mutation<ApiIrrigationLine, CreateLinePayload>({
      query: ({ gardenId, name, config }) => ({
        url: `/gardens/${gardenId}/lines`,
        method: 'POST',
        body: { name, config },
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [{ type: 'IrrigationLine', id: gardenId }],
    }),
    updateLine: builder.mutation<ApiIrrigationLine, UpdateLinePayload>({
      query: ({ gardenId, lineId, config, ...body }) => ({
        url: `/gardens/${gardenId}/lines/${lineId}`,
        method: 'PATCH',
        body: {
          ...body,
          ...(config ? { config } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [{ type: 'IrrigationLine', id: gardenId }],
    }),
    deleteLine: builder.mutation<{ message: string }, DeleteLinePayload>({
      query: ({ gardenId, lineId }) => ({
        url: `/gardens/${gardenId}/lines/${lineId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [{ type: 'IrrigationLine', id: gardenId }],
    }),
    getIrrigationCatalog: builder.query<IrrigationCatalogResponse, void>({
      query: () => '/irrigation/catalog',
    }),
    calculateIrrigation: builder.mutation<CalculateIrrigationResponse, CalculateIrrigationRequest>({
      query: ({ config, mode, legacy }) => ({
        url: '/irrigation/calculate',
        method: 'POST',
        body: { config, mode, legacy },
      }),
    }),
  }),
});

export const {
  useListLinesQuery,
  useCreateLineMutation,
  useUpdateLineMutation,
  useDeleteLineMutation,
  useGetIrrigationCatalogQuery,
  useCalculateIrrigationMutation,
} = irrigationLinesApi;
