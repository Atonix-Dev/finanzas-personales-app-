'use client';

import { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const handleSubmit = async () => {
    if (!rating && !message.trim()) {
      toast({
        title: t.feedback.emptyTitle,
        description: t.feedback.emptyDescription,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          message,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) throw new Error('Error al enviar feedback');

      toast({
        title: t.feedback.successTitle,
        description: t.feedback.successDescription,
      });

      // Reset form
      setRating(null);
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: t.feedback.errorTitle,
        description: t.feedback.errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button - Smaller & Semi-transparent with border */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-all z-50 opacity-60 hover:opacity-100 border border-border"
            size="icon"
            variant="secondary"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.feedback.title}</DialogTitle>
            <DialogDescription>
              {t.feedback.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>{t.feedback.experienceQuestion}</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={rating === 'positive' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRating('positive')}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {t.feedback.like}
                </Button>
                <Button
                  type="button"
                  variant={rating === 'negative' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRating('negative')}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  {t.feedback.dislike}
                </Button>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message">
                {rating === 'negative'
                  ? t.feedback.improveQuestion
                  : t.feedback.tellUsQuestion}
              </Label>
              <Textarea
                id="feedback-message"
                placeholder={
                  rating === 'negative'
                    ? t.feedback.improvePlaceholder
                    : t.feedback.tellUsPlaceholder
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t.feedback.suggestFeatures}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>{t.feedback.sending}</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t.feedback.send}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            Powered by{' '}
            <a
              href="https://atonixdev.com"
              target="_blank"
              className="text-primary hover:underline"
            >
              atonixdev.com
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
