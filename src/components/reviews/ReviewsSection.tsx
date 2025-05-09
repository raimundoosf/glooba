// src/components/reviews/ReviewsSection.tsx
'use client';

import { getCompanyReviewsAndStats, ReviewWithAuthor } from '@/actions/review.action';
import { Loader2, MessageSquareWarning } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReviewCard } from './ReviewCard';

interface ReviewsSectionProps {
  companyId: string;
  initialReviews: ReviewWithAuthor[];
  initialHasNextPage: boolean;
  initialTotalCount: number;
  initialAverageRating: number | null;
  initialUserHasReviewed: boolean; // Pass this down if needed by LeaveReviewForm logic
  initialError?: string;
  // Add callback to update average rating display in parent if needed
  // onStatsUpdate: (stats: { averageRating: number | null, totalCount: number }) => void;
}

export function ReviewsSection({
  companyId,
  initialReviews,
  initialHasNextPage,
  initialTotalCount,
  initialAverageRating, // Receive initial average
  initialUserHasReviewed,
  initialError,
}: ReviewsSectionProps) {
  // --- State ---
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>(initialReviews);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError || null);
  // State for average/total might be needed if we refresh stats independently
  // const [averageRating, setAverageRating] = useState(initialAverageRating);
  // const [totalCount, setTotalCount] = useState(initialTotalCount);

  // --- Refs ---
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // --- Load More Function ---
  const loadMoreReviews = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || error) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      // Fetch only reviews for subsequent pages, stats usually don't change often
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

  // --- Intersection Observer Effect ---
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

  // --- Render Logic ---
  if (error && reviews.length === 0) {
    return <p className="text-center text-destructive py-4">Error: {error}</p>;
  }

  if (!error && reviews.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-10 px-4 bg-card/30 border rounded-lg mt-6">
        <MessageSquareWarning className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay reseñas para esta empresa.</p>
        {/* Optionally add a prompt to leave the first review */}
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
