import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { FeedbackModel } from '../models/Feedback.model.js';
import type { CreateFeedbackBody, FeedbackType } from '../types/feedback.types.js';
import { sendFeedbackEmail } from '../utils/email.js';

const ALLOWED_FEEDBACK_TYPES: FeedbackType[] = ['bug', 'feature', 'general'];

function authUser(req: Request, res: Response) {
  if (!req.authUser?.id || !req.authUser.email) {
    res.status(401).json({ message: 'unauthorized' });
    return null;
  }

  return req.authUser;
}

export async function createFeedback(req: Request, res: Response) {
  try {
    const user = authUser(req, res);
    if (!user) return;

    const { type, message, pagePath } = req.body as Partial<CreateFeedbackBody>;
    const normalizedType = type?.trim().toLowerCase() as FeedbackType | undefined;
    const trimmedMessage = message?.trim();
    const trimmedPagePath = pagePath?.trim();

    if (!normalizedType || !ALLOWED_FEEDBACK_TYPES.includes(normalizedType)) {
      return res.status(400).json({ message: 'valid feedback type is required' });
    }

    if (!trimmedMessage) {
      return res.status(400).json({ message: 'feedback message is required' });
    }

    if (!trimmedPagePath) {
      return res.status(400).json({ message: 'page path is required' });
    }

    const feedback = await FeedbackModel.create({
      userId: new Types.ObjectId(user.id),
      userEmail: user.email,
      type: normalizedType,
      message: trimmedMessage,
      pagePath: trimmedPagePath,
      userAgent: req.get('user-agent')?.trim() || undefined,
      status: 'new',
    });

    await sendFeedbackEmail({
      submittedByName: user.name,
      submittedByEmail: user.email,
      type: normalizedType,
      message: trimmedMessage,
      pagePath: trimmedPagePath,
    });

    return res.status(201).json({
      id: feedback.id,
      message: 'feedback submitted',
    });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}