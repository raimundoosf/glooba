// src/actions/explore.action.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getDbUserId } from "./user.action";

// --- Constants ---
const DEFAULT_PAGE_SIZE = 6;

// --- Types ---
export interface CompanyFiltersType {
  searchTerm?: string;
  categories?: string[];
  location?: string;
}

export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

// Select base fields + relations needed for counts/calcs
const companyDataSelectBase = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  clerkId: true, // Needed for isOwnProfile check on client
  name: true,
  username: true,
  image: true,
  location: true,
  categories: true,
  bio: true,
  // Select ratings needed to calculate average
  reviewsReceived: {
      select: {
          rating: true,
      },
  },
  // Select counts directly
  _count: {
    select: {
      followers: true,    // For follower count display
      reviewsReceived: true, // For review count display
    },
  },
});

// Type reflecting the raw data fetched
type CompanyDataWithRelations = Prisma.UserGetPayload<{
  select: typeof companyDataSelectBase & {
      // Include followers relation filtered for the current user to check follow status
      followers: { select: { followerId: true } };
  }
}>;

// Final processed type for the CompanyCard component
export type CompanyCardData = Omit<
    Prisma.UserGetPayload<{ select: typeof companyDataSelectBase }>,
    'reviewsReceived' | '_count' // Remove raw relations/counts
> & {
    isFollowing: boolean;
    averageRating: number | null;
    reviewCount: number;
    followerCount: number;
};


export interface PaginatedCompaniesResponse {
    success: boolean;
    error?: string;
    companies: CompanyCardData[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
}

// --- Action Function ---
export async function getFilteredCompanies(
  filters: CompanyFiltersType,
  pagination: PaginationOptions = {}
): Promise<PaginatedCompaniesResponse> {
  try {
    const currentUserId = await getDbUserId(); // Null if not logged in

    const { searchTerm, categories, location } = filters;
    const currentPage = Math.max(1, Math.floor(pagination.page || 1));
    const currentPageSize = Math.max(1, Math.floor(pagination.pageSize || DEFAULT_PAGE_SIZE));

    const whereClause: Prisma.UserWhereInput = {
      isCompany: true,
      id: currentUserId ? { not: currentUserId } : undefined, // Exclude self
      AND: [],
    };

    // --- Apply Filters ---
    if (searchTerm) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { bio: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }
    if (categories?.length) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        categories: { hasSome: categories },
      });
    }
    if (location) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        location: { contains: location, mode: "insensitive" },
      });
    }
    if ((whereClause.AND as Prisma.UserWhereInput[]).length === 0) {
      delete whereClause.AND;
    }
    // --- End Apply Filters ---

    // --- Perform Queries ---
    const [totalCount, companiesRaw] = await prisma.$transaction([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
            where: whereClause,
            select: {
                ...companyDataSelectBase, // Base fields, ratings, counts
                // Include followers relation filtered only for the current user
                followers: {
                    where: { followerId: currentUserId ?? undefined },
                    select: { followerId: true } // Only need to know if it exists
                }
            },
            orderBy: { name: "asc" }, // Example: order by creation date or name: "asc"
            skip: (currentPage - 1) * currentPageSize,
            take: currentPageSize,
        })
    ]);

    // --- Process results ---
    const companies: CompanyCardData[] = companiesRaw.map((company: CompanyDataWithRelations) => {
        const isFollowing = !!currentUserId && company.followers.length > 0;

        // Calculate average rating from fetched ratings
        const reviewCount = company._count.reviewsReceived;
        const sumOfRatings = company.reviewsReceived.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = reviewCount > 0 ? sumOfRatings / reviewCount : null;

        const followerCount = company._count.followers;

        // Exclude raw relations/counts from the final object
        const { followers, reviewsReceived, _count, ...restOfCompany } = company;

        return {
            ...restOfCompany,
            isFollowing,
            averageRating,
            reviewCount,
            followerCount,
        };
    });

    // --- Pagination Metadata ---
    const totalPages = Math.ceil(totalCount / currentPageSize);
    const hasNextPage = currentPage < totalPages;

    return {
        success: true,
        companies,
        totalCount,
        currentPage,
        pageSize: currentPageSize,
        hasNextPage,
    };

  } catch (error: unknown) {
    console.error("Error fetching filtered companies:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
        success: false,
        error: `Failed to fetch companies: ${errorMessage}`,
        companies: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        hasNextPage: false,
    };
  }
}