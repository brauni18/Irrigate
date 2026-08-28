export type SignupBody = {
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
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyEmailBody = {
  email: string;
  token: string;
};

export type ResendVerificationBody = {
  email: string;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};

export type SignupResponse = {
  message: string;
  requiresEmailVerification: boolean;
};