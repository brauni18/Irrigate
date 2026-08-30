import { useState, useRef } from 'react';
import { Bug, Lightbulb, MessageCircleMore } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog';
import { cn } from '@/shadcn/lib/utils';
import { useCreateFeedbackMutation } from '@/store/apis/feedback.api';

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FEEDBACK_OPTIONS = [
  {
    key: 'bug',
    label: 'Found a bug',
    prompt: 'Describe the bug, what you expected, and what happened instead.',
    icon: Bug,
  },
  {
    key: 'feature',
    label: 'Feature suggestion',
    prompt: 'Describe the feature and the problem it would solve.',
    icon: Lightbulb,
  },
  {
    key: 'general',
    label: 'General feedback',
    prompt: 'Share any general feedback about this screen or flow.',
    icon: MessageCircleMore,
  },
] as const;

type FeedbackOptionKey = (typeof FEEDBACK_OPTIONS)[number]['key'];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FeedbackOptionKey | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const selectedFeedbackOption = FEEDBACK_OPTIONS.find((option) => option.key === selectedOption);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setFeedbackSent(false);
      setSelectedOption(null);
      setSubmitError(null);
      setFeedbackMessage('');
    }
  };

  const handleSelectOption = (optionKey: FeedbackOptionKey) => {
    setSelectedOption(optionKey);
    setFeedbackSent(false);
    setSubmitError(null);

    queueMicrotask(() => {
      textareaRef.current?.focus();
    });
  };

  const handleSendFeedback = async () => {
    const trimmedMessage = feedbackMessage.trim();
    const feedbackType = selectedOption;

    if (!trimmedMessage || !feedbackType) {
      return;
    }

    try {
      setSubmitError(null);
      await createFeedback({
        type: feedbackType,
        message: trimmedMessage,
        pagePath: window.location.pathname,
      }).unwrap();
      setFeedbackSent(true);
    } catch (error) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data &&
        typeof error.data.message === 'string'
          ? error.data.message
          : 'Unable to send feedback right now.';

      setSubmitError(errorMessage);
      setFeedbackSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share feedback</DialogTitle>
          <DialogDescription>
           hey there! we would love to hear your feedback. Please select a feedback type and provide your comments below. Your input helps us improve the experience. 
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2">
          {FEEDBACK_OPTIONS.map((option) => {
            const isSelected = option.key === selectedOption;
            const Icon = option.icon;

            return (
              <Button
                key={option.key}
                type="button"
                variant="outline"
                className={cn(
                  'h-auto min-h-20 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/50 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected && 'border-primary/40 bg-primary/8 text-foreground hover:bg-primary/12'
                )}
                onClick={() => handleSelectOption(option.key)}
              >
                <span className="flex w-full items-start gap-3">
                  <span className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-colors',
                    isSelected && 'border-primary/30 bg-primary/12 text-primary'
                  )}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold leading-tight">{option.label}</span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {option.prompt}
                    </span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <textarea
          ref={textareaRef}
          value={feedbackMessage}
          onChange={(event) => {
            setFeedbackMessage(event.target.value);
            setFeedbackSent(false);
            setSubmitError(null);
          }}
          placeholder={selectedFeedbackOption?.prompt ?? 'Choose a feedback type to start writing.'}
          className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-1 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-full px-4 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            onClick={() => handleOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="h-8 min-w-24 rounded-full border border-primary/20 bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
            onClick={handleSendFeedback}
            disabled={!feedbackMessage.trim() || !selectedOption || isLoading}
          >
            {isLoading ? 'Sending...' : feedbackSent ? 'Sent' : 'Send feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}