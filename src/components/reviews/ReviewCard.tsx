// src/components/reviews/ReviewCard.tsx
'use client'; // Needs useEffect for time formatting

import { ReviewWithAuthor } from '@/actions/review.action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Read-only Star Display Component
function DisplayStars({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = Array(5).fill(0);
  return (
    <div className="flex items-center space-x-0.5">
      {stars.map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-colors',
              starValue <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            )}
          />
        );
      })}
    </div>
  );
}

// Helper for Relative Time (avoids hydration errors)
function RelativeTime({ date }: { date: Date }) {
  const [relativeTime, setRelativeTime] = useState<string | null>(null);
  useEffect(() => {
    setRelativeTime(
      formatDistanceToNowStrict(new Date(date), {
        addSuffix: true,
        locale: es,
      })
    );
  }, [date]);

  const fullDate = format(new Date(date), 'PPp', { locale: es });
  return (
    <time dateTime={new Date(date).toISOString()} title={fullDate} suppressHydrationWarning={true}>
      {relativeTime ?? fullDate.split(',')[0]}
    </time>
  );
}

interface ReviewCardProps {
  review: ReviewWithAuthor;
  // Add props for delete/edit functionality later if needed
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="bg-card/50 dark:bg-card/30 shadow-sm border">
      <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-2 pt-4 px-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${review.author.username}`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={review.author.image ?? undefined} />
              <AvatarFallback>
                {review.author.name?.[0] || review.author.username[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link
              href={`/profile/${review.author.username}`}
              className="text-sm font-semibold hover:underline"
            >
              {review.author.name ?? review.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              <RelativeTime date={review.createdAt} />
            </span>
          </div>
        </div>
        {/* Display Star Rating */}
        <DisplayStars rating={review.rating} size={16} />
      </CardHeader>
      {review.content && (
        <CardContent className="px-4 pb-4 pt-2">
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {review.content}
          </p>
        </CardContent>
      )}
      {/* Optional Footer for actions like 'Helpful?' */}
      {/* <CardFooter className="px-4 pb-3 pt-1"> ... </CardFooter> */}
    </Card>
  );
}
