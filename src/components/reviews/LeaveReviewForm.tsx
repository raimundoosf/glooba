// src/components/reviews/LeaveReviewForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { createReview } from '@/actions/review.action';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRatingInput } from './StarRatingInput'; // Import star input
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface LeaveReviewFormProps {
  companyId: string;
  companyUsername: string; // Needed for revalidation path
  onReviewSubmitted: () => Promise<void>; // Callback after successful submission
  initialRating?: number; // For potential edit functionality later
  initialContent?: string; // For potential edit functionality later
  isEditing?: boolean; // Flag if editing existing review
}

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation (rating is required, 0 is allowed)
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
          setContent(''); // Clear form
          setRating(0);
          await onReviewSubmitted(); // Call the refresh callback
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
