import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/user.slice';
import { usersApi } from './apis/users.api';
import { gardensApi } from './apis/gardens.api';
import { irrigationLinesApi } from './apis/irrigationLines.api';
import { setupListeners } from '@reduxjs/toolkit/query/react';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [gardensApi.reducerPath]: gardensApi.reducer,
    [irrigationLinesApi.reducerPath]: irrigationLinesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware, gardensApi.middleware, irrigationLinesApi.middleware),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
