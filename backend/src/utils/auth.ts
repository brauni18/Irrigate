import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { AuthenticatedUser } from '../types/auth.types.js';

type TokenClaims = JwtPayload & {
  sub: string;
  email: string;
  name: string;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signAuthToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret(),
    { expiresIn: '7d' },
  );
}

export function verifyAuthToken(token: string): AuthenticatedUser | null {
  try {
    const payload = jwt.verify(token, jwtSecret()) as TokenClaims;
    if (!payload?.sub || !payload.email || !payload.name) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}