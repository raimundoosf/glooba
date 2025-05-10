/**
 * Form component for leaving or editing reviews.
 * @module LeaveReviewForm
 */
'use client';

import { createReview } from '@/actions/review.action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { StarRatingInput } from './StarRatingInput';

/**
 * Props interface for the LeaveReviewForm component
 * @interface LeaveReviewFormProps
 */
interface LeaveReviewFormProps {
  companyId: string;
  companyUsername: string;
  onReviewSubmitted: () => Promise<void>;
  initialRating?: number;
  initialContent?: string;
  isEditing?: boolean;
}

/**
 * Main component for leaving or editing reviews.
 * @param {LeaveReviewFormProps} props - Component props
 * @returns {JSX.Element} The review form component
 */
export function LeaveReviewForm({
  companyId,
  companyUsername,
  onReviewSubmitted,
  initialRating = 0,
  initialContent = '',
  isEditing = false,
}: LeaveReviewFormProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [content, setContent] = useState<string>(initialContent);
  const [isPending, startTransition] = useTransition();

  /**
   * Handles form submission and review creation/update.
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (rating < 0 || rating > 5) {
      toast.error('Por favor selecciona una calificación entre 0 y 5 estrellas.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createReview({
          companyId,
          rating,
          content,
          companyUsername,
        });

        if (result.success) {
          toast.success(isEditing ? '¡Reseña actualizada!' : '¡Reseña enviada!');
          setContent('');
          setRating(0);
          await onReviewSubmitted();
        } else {
          throw new Error(result.error || 'No se pudo enviar la reseña.');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        toast.error(
          `Error: ${error instanceof Error ? error.message : 'No se pudo enviar la reseña.'}`
        );
      }
    });
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? 'Actualizar tu reseña' : 'Dejar una reseña'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tu calificación <span className="text-destructive">*</span>
            </label>
            <StarRatingInput value={rating} onChange={setRating} disabled={isPending} size={28} />
          </div>
          <div>
            <label
              htmlFor="reviewContent"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Tu reseña (Opcional)
            </label>
            <Textarea
              id="reviewContent"
              placeholder="Comparte tu experiencia..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || rating < 0}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending
                ? isEditing
                  ? 'Actualizando...'
                  : 'Enviando...'
                : isEditing
                  ? 'Actualizar reseña'
                  : 'Enviar reseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
