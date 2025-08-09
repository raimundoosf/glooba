import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface DisplayStarsProps {
  rating: number | null | undefined;
  count?: number;
  size?: number;
  className?: string;
  textSize?: 'xs' | 'sm' | 'base' | 'lg';
}

/**
 * Muestra una estrella con el promedio de calificación y el contador de reseñas
 */
export function DisplayStars({ 
  rating, 
  count, 
  size = 14, 
  className, 
  textSize = 'xs' 
}: DisplayStarsProps) {
  const isValidRating = typeof rating === 'number' && !isNaN(rating) && rating >= 0 && rating <= 5;
  const hasCount = typeof count === 'number' && count > 0;

  if (!isValidRating) {
    return (
      <span className={cn(`text-${textSize}`, 'text-muted-foreground flex items-center', className)}>
        <Star className="mr-1 text-muted-foreground/50" size={size} />
        {hasCount ? count : 'Sin reseñas'}
      </span>
    );
  }

  // Redondear a 1 decimal
  const displayRating = Math.round(rating * 10) / 10;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="relative flex items-center">
        <Star
          className="text-yellow-400"
          size={size}
          fill="currentColor"
          strokeWidth={1.5}
        />
        <span className={`text-${textSize} font-medium ml-0.5`}>
          {displayRating}
        </span>
      </div>
      {hasCount && (
        <span className={`text-${textSize} text-muted-foreground`}>
          ({count})
        </span>
      )}
    </div>
  );
}
