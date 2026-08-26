export type FeedbackType = 'bug' | 'feature' | 'general';

export type CreateFeedbackPayload = {
  type: FeedbackType;
  message: string;
  pagePath: string;
};

export type CreateFeedbackResponse = {
  id: string;
  message: string;
};