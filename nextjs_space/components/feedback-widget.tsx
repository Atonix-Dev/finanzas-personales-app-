'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
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

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating && !message.trim()) {
      toast({
        title: 'Feedback vacío',
        description: 'Por favor, selecciona una calificación o escribe un mensaje.',
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
        title: '¡Gracias por tu feedback! 🎉',
        description: 'Tu opinión nos ayuda a mejorar la app.',
      });

      // Reset form
      setRating(null);
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el feedback. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>¿Qué opinas de Finanzas App?</DialogTitle>
            <DialogDescription>
              Tu feedback es muy valioso para nosotros. Ayúdanos a mejorar 🚀
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>¿Cómo ha sido tu experiencia?</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={rating === 'positive' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRating('positive')}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Me gusta
                </Button>
                <Button
                  type="button"
                  variant={rating === 'negative' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setRating('negative')}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  No me gusta
                </Button>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message">
                {rating === 'negative'
                  ? '¿Qué podemos mejorar?'
                  : '¿Qué te gustaría decirnos?'}
              </Label>
              <Textarea
                id="feedback-message"
                placeholder={
                  rating === 'negative'
                    ? 'Cuéntanos qué no te gustó o qué podemos mejorar...'
                    : 'Cuéntanos qué te gustó o sugiere nuevas features...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                También puedes sugerirnos nuevas funcionalidades 💡
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
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Feedback
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
