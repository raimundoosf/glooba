// src/actions/review.actions.ts
"use server";

import prisma from "@/lib/prisma"; // Assuming prisma client setup at lib/prisma
import { getDbUserId } from "./user.action"; // Action to get current user's DB ID
import { revalidatePath } from "next/cache"; // For cache invalidation
import { Prisma } from "@prisma/client"; // Import Prisma types

// --- Constants ---
const REVIEW_PAGE_SIZE = 10; // Number of reviews per page

// --- Types ---

// Prisma validator to ensure consistent author data selection for reviews
const reviewIncludeAuthor = Prisma.validator<Prisma.ReviewInclude>()({
  author: {
    select: { id: true, username: true, name: true, image: true } // Select desired author fields
  }
});

// Type representing a Review object with the included Author data
export type ReviewWithAuthor = Prisma.ReviewGetPayload<{ include: typeof reviewIncludeAuthor }>;

// Type for pagination options passed to actions
export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

// Type for the structured response when fetching paginated reviews and stats
export interface PaginatedReviewsResponse {
    success: boolean; // Indicates if the operation was successful
    error?: string; // Optional error message
    reviews: ReviewWithAuthor[]; // Array of reviews for the current page
    totalCount: number; // Total number of reviews matching the criteria
    averageRating: number | null; // Average rating (null if no reviews)
    userHasReviewed: boolean; // Flag indicating if the current logged-in user has reviewed this company
    currentPage: number; // The current page number returned
    pageSize: number; // The number of items per page used
    hasNextPage: boolean; // Flag indicating if more pages are available
}

// --- Action: Create or Update a Review ---
export async function createReview({
    companyId,          // ID of the company (User) being reviewed
    rating,             // Star rating (0-5)
    content,            // Optional review text
    companyUsername     // Username of the company (needed for cache revalidation)
}: {
    companyId: string;
    rating: number;
    content?: string;
    companyUsername: string;
}): Promise<{ success: boolean; error?: string }> { // Return simple success/error status

    const authorId = await getDbUserId(); // Get the ID of the user writing the review
    if (!authorId) {
        return { success: false, error: "User not authenticated." };
    }

    // Prevent users from reviewing themselves
    if (authorId === companyId) {
        return { success: false, error: "You cannot review your own profile." };
    }

    // Validate the rating value
    if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
        return { success: false, error: "Rating must be an integer between 0 and 5." };
    }

    try {
        // Check if a review from this author for this company already exists
        const existingReview = await prisma.review.findUnique({
            where: { authorId_companyId: { authorId, companyId } }, // Uses the @@unique constraint
        });

        const reviewData = {
            rating,
            content: content?.trim() || null, // Store null if content is empty/whitespace
        };

        if (existingReview) {
            // If review exists, update it
            await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    ...reviewData,
                    updatedAt: new Date(), // Explicitly update the timestamp
                },
            });
            console.log(`Review updated by user ${authorId} for company ${companyId}`);
        } else {
            // If review doesn't exist, create a new one
            await prisma.review.create({
                data: {
                    ...reviewData,
                    authorId,
                    companyId,
                },
            });
            console.log(`Review created by user ${authorId} for company ${companyId}`);
        }

        // Invalidate the cache for the company's profile page so it refetches data
        revalidatePath(`/profile/${companyUsername}`);

        return { success: true }; // Indicate success

    } catch (error: unknown) {
        console.error("Error creating/updating review:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";

        // Handle potential unique constraint violation during create (race condition?)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return { success: false, error: "You seem to have already reviewed this company recently." };
        }
        return { success: false, error: `Failed to submit review: ${message}` };
    }
}


// --- Action: Get Company Reviews (Paginated) & Stats ---
export async function getCompanyReviewsAndStats({
    companyId,          // ID of the company (User) whose reviews to fetch
    pagination = {}     // Optional pagination parameters
}: {
    companyId: string;
    pagination?: PaginationOptions;
}): Promise<PaginatedReviewsResponse> {

    // Get current user's ID to check if they have submitted a review for this company
    const currentUserId = await getDbUserId();

    try {
        // Set defaults and validate pagination parameters
        const { page = 1, pageSize = REVIEW_PAGE_SIZE } = pagination;
        const currentPage = Math.max(1, Math.floor(page));
        const currentPageSize = Math.max(1, Math.floor(pageSize));

        // Define the filter for reviews belonging to the specified company
        const whereClause: Prisma.ReviewWhereInput = { companyId };

        // --- Use Promise.all for concurrent read operations ---
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
            _count: { rating: true } // Get count of reviews with ratings
        });

        // Conditionally create the promise to check if the current user has reviewed
        // If user is not logged in (currentUserId is null), resolve immediately to null
        const userReviewPromise: Promise<{ id: string } | null> = currentUserId
            ? prisma.review.findUnique({
                where: { authorId_companyId: { authorId: currentUserId, companyId } },
                select: { id: true } // Only need to know if it exists
              })
            : Promise.resolve(null);

        // Await all promises concurrently
        const [totalCount, reviews, ratingAggregation, userReview] = await Promise.all([
            countPromise,
            reviewsPromise,
            ratingAggregationPromise,
            userReviewPromise
        ]);
        // --- End Promise.all ---

        // Process results
        const averageRating = ratingAggregation._avg.rating; // Can be null if no reviews
        const hasNextPage = (currentPage * currentPageSize) < totalCount;
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
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        // Return a structured error response
        return {
            success: false, error: `Failed to load reviews: ${message}`,
            reviews: [], totalCount: 0, averageRating: null, userHasReviewed: false,
            currentPage: 1, pageSize: REVIEW_PAGE_SIZE, hasNextPage: false
        };
    }
}
