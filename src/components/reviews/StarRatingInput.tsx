// src/components/reviews/StarRatingInput.tsx
'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number; // Current rating value (0-5)
  onChange: (rating: number) => void;
  size?: number; // Size of the stars (e.g., 24)
  className?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  size = 24, // Default size
  className,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const stars = Array(5).fill(0);

  const handleClick = (newValue: number) => {
    if (disabled) return;
    // Allow clicking the same star again to set rating to that value
    // Allow clicking star 1 when value is 1 to set to 0? Or require explicit clear?
    // Let's make clicking star 1 when value=1 clear it (set to 0)
    if (value === 1 && newValue === 1) {
      onChange(0);
    } else {
      onChange(newValue);
    }
  };

  const handleMouseOver = (newHoverValue: number) => {
    if (disabled) return;
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(undefined);
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {stars.map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverValue ?? value); // Fill based on hover or actual value

        return (
          <button
            type="button" // Prevent form submission if inside a form
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
      {/* Optional: Display current numeric value */}
      {/* <span className="ml-2 text-sm text-muted-foreground">({value}/5)</span> */}
    </div>
  );
}
