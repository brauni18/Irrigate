import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { VITE_API_URL } from '@/consts/consts';

type ApiUser = {
  _id: string;
  email: string;
  name: string;
  posts: string[];
  createdAt: string;
  updatedAt: string;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: VITE_API_URL }),
  endpoints: (builder) => ({
    listUsers: builder.query<ApiUser[], void>({
      query: () => '/users',
    }),
  }),
});

export const { useListUsersQuery, useLazyListUsersQuery } = usersApi;
