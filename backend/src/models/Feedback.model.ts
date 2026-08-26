import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import type { FeedbackType } from '../types/feedback.types.js';

type Feedback = {
  userId: Types.ObjectId;
  userEmail: string;
  type: FeedbackType;
  message: string;
  pagePath: string;
  userAgent?: string;
  status: 'new' | 'reviewed' | 'closed';
};

export type FeedbackModelType = HydratedDocument<Feedback>;

const FeedbackSchema = new Schema<Feedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, required: true, enum: ['bug', 'feature', 'general'] },
    message: { type: String, required: true, trim: true },
    pagePath: { type: String, required: true, trim: true },
    userAgent: { type: String, trim: true },
    status: { type: String, required: true, enum: ['new', 'reviewed', 'closed'], default: 'new' },
  },
  { timestamps: true },
);

export const FeedbackModel = model<Feedback>('Feedback', FeedbackSchema);