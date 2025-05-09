// src/components/reviews/DisplayStars.tsx
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisplayStarsProps {
  rating: number | null | undefined;
  count?: number;
  size?: number;
  className?: string; // Allow passing additional classes
}

export function DisplayStars({ rating, count, size = 16, className }: DisplayStarsProps) {
  // Handle null, undefined, or potentially invalid ratings gracefully
  const isValidRating = typeof rating === 'number' && !isNaN(rating) && rating >= 0 && rating <= 5;

  if (!isValidRating) {
    return <span className={cn('text-xs text-muted-foreground', className)}>Sin reseñas</span>;
  }

  const stars = Array(5).fill(0);
  // Round to nearest 0.5, ensuring it stays within 0-5 range
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
              'flex-shrink-0 transition-colors', // Added flex-shrink-0
              starValue <= roundedRating
                ? 'text-yellow-400 fill-yellow-400' // Full star
                : // Basic half-star implementation (optional, requires more complex SVG for true partial fill)
                  // else if (starValue - 0.5 === roundedRating) {
                  //   return "text-yellow-400"; // Needs custom handling for partial fill
                  // }
                  'text-gray-300 dark:text-gray-600' // Empty star
            )}
            // Hide decorative stars from screen readers, label provided on the container
            aria-hidden="true"
          />
        );
      })}
      {typeof count === 'number' && count >= 0 && (
        <span className="ml-1.5 text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
      {/* Screen reader text moved to the container's aria-label */}
    </div>
  );
}
