/**
 * Section component for displaying company reviews with infinite scrolling.
 * @module ReviewsSection
 */
'use client';

import { getCompanyReviewsAndStats, ReviewWithAuthor } from '@/actions/review.action';
import { Loader2, MessageSquareWarning } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReviewCard } from './ReviewCard';

/**
 * Props interface for the ReviewsSection component
 * @interface ReviewsSectionProps
 */
interface ReviewsSectionProps {
  companyId: string;
  initialReviews: ReviewWithAuthor[];
  initialHasNextPage: boolean;
  initialTotalCount: number;
  initialAverageRating: number | null;
  initialUserHasReviewed: boolean;
  initialError?: string;
}

/**
 * Main component for displaying company reviews with infinite scrolling.
 * @param {ReviewsSectionProps} props - Component props
 * @returns {JSX.Element} The reviews section component
 */
export function ReviewsSection({
  companyId,
  initialReviews,
  initialHasNextPage,
  initialTotalCount,
  initialAverageRating,
  initialUserHasReviewed,
  initialError,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>(initialReviews);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles loading more reviews when the sentinel element is in view.
   */
  const loadMoreReviews = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || error) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const result = await getCompanyReviewsAndStats({
        companyId,
        pagination: { page: nextPage },
      });
      if (result.success) {
        setReviews((prev) => [...prev, ...result.reviews]);
        setHasNextPage(result.hasNextPage);
        setCurrentPage(result.currentPage);
        setError(null);
      } else {
        setError(result.error || 'No se pudieron cargar más reseñas.');
        setHasNextPage(false);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al cargar más reseñas.');
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, currentPage, error, companyId]);

  /**
   * Sets up and manages the Intersection Observer for infinite scrolling.
   */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !error) {
          loadMoreReviews();
        }
      },
      { rootMargin: '200px' }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) observerRef.current.observe(currentRef);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isLoadingMore, loadMoreReviews, error]);

  if (error && reviews.length === 0) {
    return <p className="text-center text-destructive py-4">Error: {error}</p>;
  }

  if (!error && reviews.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-10 px-4 bg-card/30 border rounded-lg mt-6">
        <MessageSquareWarning className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay reseñas para esta empresa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasNextPage && <div ref={loadMoreRef} style={{ height: '50px' }} />}

      <div className="flex justify-center py-4">
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        {!hasNextPage && !isLoadingMore && reviews.length > 0 && (
          <p className="text-sm text-muted-foreground">No hay más reseñas.</p>
        )}
        {error && !isLoadingMore && reviews.length > 0 && (
          <p className="text-sm text-destructive">No se pudieron cargar más reseñas.</p>
        )}
      </div>
    </div>
  );
}
