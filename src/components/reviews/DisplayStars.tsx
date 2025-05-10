/**
 * Component for displaying star ratings with optional count.
 * @module DisplayStars
 */
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

/**
 * Props interface for the DisplayStars component
 * @interface DisplayStarsProps
 */
interface DisplayStarsProps {
  rating: number | null | undefined;
  count?: number;
  size?: number;
  className?: string;
}

/**
 * Renders a star rating display with optional count.
 * @param {DisplayStarsProps} props - Component props
 * @returns {JSX.Element} The star rating display
 */
export function DisplayStars({ rating, count, size = 16, className }: DisplayStarsProps) {
  const isValidRating = typeof rating === 'number' && !isNaN(rating) && rating >= 0 && rating <= 5;

  if (!isValidRating) {
    return <span className={cn('text-xs text-muted-foreground', className)}>Sin reseñas</span>;
  }

  const stars = Array(5).fill(0);
  const roundedRating = Math.min(5, Math.max(0, Math.round(rating * 2) / 2));

  return (
    <div
      className={cn('flex items-center space-x-0.5', className)}
      aria-label={`${rating.toFixed(1)} de 5 estrellas`}
    >
      {stars.map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'flex-shrink-0 transition-colors',
              starValue <= roundedRating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            )}
            aria-hidden="true"
          />
        );
      })}
      {typeof count === 'number' && count >= 0 && (
        <span className="ml-1.5 text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
