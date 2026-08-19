export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupResponse = {
  message: string;
  requiresEmailVerification: boolean;
};
