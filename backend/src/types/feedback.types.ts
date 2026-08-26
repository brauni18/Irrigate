export type FeedbackType = 'bug' | 'feature' | 'general';

export type CreateFeedbackBody = {
  type: FeedbackType;
  message: string;
  pagePath: string;
};