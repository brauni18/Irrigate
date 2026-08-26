import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createFeedback } from '../controllers/feedback.controller.js';

export const feedbackRouter = Router();

const feedbackLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Too many feedback submissions. Please try again later.' },
});

feedbackRouter.post('/', feedbackLimiter, createFeedback);