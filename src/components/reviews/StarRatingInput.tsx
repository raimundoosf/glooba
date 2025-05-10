/**
 * Interactive star rating input component.
 * @module StarRatingInput
 */
'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

/**
 * Props interface for the StarRatingInput component
 * @interface StarRatingInputProps
 */
interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Interactive star rating input component with hover and click functionality.
 * @param {StarRatingInputProps} props - Component props
 * @returns {JSX.Element} The star rating input component
 */
export function StarRatingInput({
  value,
  onChange,
  size = 24,
  className,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const stars = Array(5).fill(0);

  /**
   * Handles star click events, including special case for clearing rating.
   * @param {number} newValue - The star value that was clicked
   */
  const handleClick = (newValue: number) => {
    if (disabled) return;
    if (value === 1 && newValue === 1) {
      onChange(0);
    } else {
      onChange(newValue);
    }
  };

  /**
   * Handles mouse over events on stars.
   * @param {number} newHoverValue - The star value that is being hovered
   */
  const handleMouseOver = (newHoverValue: number) => {
    if (disabled) return;
    setHoverValue(newHoverValue);
  };

  /**
   * Handles mouse leave events on stars.
   */
  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(undefined);
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {stars.map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue ?? value);

        return (
          <button
            type="button"
            key={starValue}
            style={{ height: size, width: size }}
            className={cn(
              'p-0 bg-transparent border-none cursor-pointer transition-colors duration-150 ease-in-out',
              disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'
            )}
            onClick={() => handleClick(starValue)}
            onMouseOver={() => handleMouseOver(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            aria-label={`Calificar ${starValue} de 5 estrellas`}
          >
            <Star
              height={size}
              width={size}
              className={cn(
                'transition-colors duration-150 ease-in-out',
                isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
