import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, AuthUser } from '@/types/user.type';

type UserState = {
  token: string | null;
  profile: AuthUser | null;
  isAuthenticated: boolean;
};

const AUTH_STORAGE_KEY = 'irrigate.auth';

function readStoredAuth(): Pick<UserState, 'token' | 'profile'> {
  if (typeof window === 'undefined') {
    return { token: null, profile: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, profile: null };

    const parsed = JSON.parse(raw) as { token?: string; profile?: AuthUser };

    if (!parsed.token || !parsed.profile) {
      return { token: null, profile: null };
    }

    return {
      token: parsed.token,
      profile: parsed.profile,
    };
  } catch {
    return { token: null, profile: null };
  }
}

function persistAuth(token: string | null, profile: AuthUser | null) {
  if (typeof window === 'undefined') return;

  if (!token || !profile) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, profile }));
}

const storedAuth = readStoredAuth();

const initialState: UserState = {
  token: storedAuth.token,
  profile: storedAuth.profile,
  isAuthenticated: Boolean(storedAuth.token),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.profile = action.payload.user;
      state.isAuthenticated = true;
      persistAuth(state.token, state.profile);
    },
    setUserProfile: (state, action: PayloadAction<AuthUser>) => {
      state.profile = action.payload;
      state.isAuthenticated = Boolean(state.token);
      persistAuth(state.token, state.profile);
    },
    clearSession: (state) => {
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      persistAuth(null, null);
    }
  }
});

export const { setCredentials, setUserProfile, clearSession } = userSlice.actions;

export default userSlice.reducer;
