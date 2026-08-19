import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../utils/auth.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'missing authorization token' });
  }

  const token = authorization.slice('Bearer '.length).trim();
  const authUser = verifyAuthToken(token);

  if (!authUser) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  req.authUser = authUser;
  return next();
}