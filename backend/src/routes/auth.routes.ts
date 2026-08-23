import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me, resendVerification, signup, verifyEmail } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many auth requests. Please try again later.' },
});

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many login attempts. Please try again later.' },
});

authRouter.post('/signup', authLimiter, signup);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/verify-email', authLimiter, verifyEmail);
authRouter.post('/resend-verification', authLimiter, resendVerification);
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', requireAuth, logout);