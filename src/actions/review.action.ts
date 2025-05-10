'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getDbUserId } from './user.action';

const REVIEW_PAGE_SIZE = 10;

const reviewIncludeAuthor = Prisma.validator<Prisma.ReviewInclude>()({
  author: {
    select: { id: true, username: true, name: true, image: true },
  },
});

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: typeof reviewIncludeAuthor;
}>;

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedReviewsResponse {
  success: boolean;
  error?: string;
  reviews: ReviewWithAuthor[];
  totalCount: number;
  averageRating: number | null;
  userHasReviewed: boolean;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
}


/**
 * Create a new review or update an existing one for a company.
 *
 * The function takes the ID of the company being reviewed, the rating, optional review text, and the company's username (for cache revalidation).
 * It returns a simple success/error status object with an optional error message.
 *
 * It first checks if the user is authenticated and if they are trying to review themselves (both are invalid).
 * Then it validates the rating value and checks if a review from the same user for the same company already exists.
 * If it does, it updates the existing review. If not, it creates a new one.
 * Finally, it invalidates the cache for the company's profile page so it refetches data.
 */
export async function createReview({
  companyId, // ID of the company (User) being reviewed
  rating, // Star rating (0-5)
  content, // Optional review text
  companyUsername, // Username of the company (needed for cache revalidation)
}: {
  companyId: string;
  rating: number;
  content?: string;
  companyUsername: string;
}): Promise<{ success: boolean; error?: string }> {
  // Return simple success/error status

  const authorId = await getDbUserId();
  if (!authorId) {
    return { success: false, error: 'User not authenticated.' };
  }

  if (authorId === companyId) {
    return { success: false, error: 'You cannot review your own profile.' };
  }

  if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
    return {
      success: false,
      error: 'Rating must be an integer between 0 and 5.',
    };
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { authorId_companyId: { authorId, companyId } },
    });

    const reviewData = {
      rating,
      content: content?.trim() || null,
    };

    if (existingReview) {
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          ...reviewData,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.review.create({
        data: {
          ...reviewData,
          authorId,
          companyId,
        },
      });
    }

    revalidatePath(`/profile/${companyUsername}`);

    return { success: true }; // Indicate success
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: 'You seem to have already reviewed this company recently.',
      };
    }
    return { success: false, error: `Failed to submit review: ${message}` };
  }
}


/**
 * Fetches a paginated list of reviews for a company (User) and the associated metadata.
 *
 * @param {Object} options - Options object with parameters
 * @param {string} options.companyId - ID of the company (User) whose reviews to fetch
 * @param {Object} [options.pagination={}] - Optional pagination parameters
 * @param {number} [options.pagination.page=1] - Page number to fetch
 * @param {number} [options.pagination.pageSize=REVIEW_PAGE_SIZE] - Number of reviews to fetch per page
 *
 * @returns {Promise<PaginatedReviewsResponse>} - A promise that resolves to a structured response containing the reviews and metadata
 *
 * @typedef {Object} PaginatedReviewsResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} error - Error message if the request failed
 * @property {ReviewWithAuthor[]} reviews - Array of reviews with author details
 * @property {number} totalCount - Total count of reviews for the company
 * @property {number | null} averageRating - Average rating of reviews, or null if no reviews
 * @property {boolean} userHasReviewed - Indicates if the current user has reviewed the company
 * @property {number} currentPage - Page number of the fetched reviews
 * @property {number} pageSize - Number of reviews per page
 * @property {boolean} hasNextPage - Indicates if there are more reviews to fetch
 */
export async function getCompanyReviewsAndStats({
  companyId, // ID of the company (User) whose reviews to fetch
  pagination = {}, // Optional pagination parameters
}: {
  companyId: string;
  pagination?: PaginationOptions;
}): Promise<PaginatedReviewsResponse> {
  const currentUserId = await getDbUserId();

  try {
    const { page = 1, pageSize = REVIEW_PAGE_SIZE } = pagination;
    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    const whereClause: Prisma.ReviewWhereInput = { companyId };

    const countPromise = prisma.review.count({ where: whereClause });

    const reviewsPromise = prisma.review.findMany({
      where: whereClause,
      include: reviewIncludeAuthor, // Include author details
      orderBy: { createdAt: 'desc' }, // Show newest reviews first
      skip: (currentPage - 1) * currentPageSize, // Calculate offset
      take: currentPageSize, // Limit number of results
    });

    const ratingAggregationPromise = prisma.review.aggregate({
      where: whereClause,
      _avg: { rating: true }, // Calculate average rating
      _count: { rating: true }, // Get count of reviews with ratings
    });

    // Conditionally create the promise to check if the current user has reviewed
    // If user is not logged in (currentUserId is null), resolve immediately to null
    const userReviewPromise: Promise<{ id: string } | null> = currentUserId
      ? prisma.review.findUnique({
        where: { authorId_companyId: { authorId: currentUserId, companyId } },
        select: { id: true }, // Only need to know if it exists
      })
      : Promise.resolve(null);

    // Await all promises concurrently
    const [totalCount, reviews, ratingAggregation, userReview] = await Promise.all([
      countPromise,
      reviewsPromise,
      ratingAggregationPromise,
      userReviewPromise,
    ]);
    // --- End Promise.all ---

    // Process results
    const averageRating = ratingAggregation._avg.rating; // Can be null if no reviews
    const hasNextPage = currentPage * currentPageSize < totalCount;
    const userHasReviewed = !!userReview; // True if the userReview query found a record

    // Return the structured response
    return {
      success: true,
      reviews,
      totalCount,
      averageRating,
      userHasReviewed,
      currentPage,
      pageSize: currentPageSize,
      hasNextPage,
    };
  } catch (error: unknown) {
    // Handle any errors during the fetching process
    console.error(`Error fetching reviews/stats for company ${companyId}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Return a structured error response
    return {
      success: false,
      error: `Failed to load reviews: ${message}`,
      reviews: [],
      totalCount: 0,
      averageRating: null,
      userHasReviewed: false,
      currentPage: 1,
      pageSize: REVIEW_PAGE_SIZE,
      hasNextPage: false,
    };
  }
}
