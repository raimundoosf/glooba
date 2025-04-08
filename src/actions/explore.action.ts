// src/actions/explore.action.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getDbUserId } from "./user.action"; // Import getDbUserId

// --- Constants ---
const DEFAULT_PAGE_SIZE = 6; // Adjusted page size

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

// Base select for company data - keep this separate
const companyDataSelectBase = Prisma.validator<Prisma.UserSelect>()({
  id: true, // Need ID for follow action
  clerkId: true, // Need clerkId to compare against loggedInUser in Card (optional but good)
  name: true,
  username: true,
  image: true,
  location: true,
  categories: true,
  bio: true,
  _count: {
    select: {
      followers: true, // Total follower count
    },
  },
});

// Define the extended type for company data including follow status check result
// This type reflects what the Prisma query will return temporarily
type CompanyDataWithFollowCheck = Prisma.UserGetPayload<{
  select: typeof companyDataSelectBase & {
      // Include a boolean based on the nested query below
      followers: { select: { followerId: true } }; // Check if the relation exists
  }
}>;

// Final type for the CompanyCard component, adding our processed boolean
export type CompanyCardData = Omit<CompanyDataWithFollowCheck, 'followers'> & {
    isFollowing: boolean; // Add our custom boolean field
};


// Define the return type including pagination info and success/error status
export interface PaginatedCompaniesResponse {
    success: boolean; // Indicate success/failure
    error?: string; // Optional error message
    companies: CompanyCardData[]; // Use the final updated type
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
    // Get logged-in user's DB ID. Returns null if not logged in.
    const currentUserId = await getDbUserId();

    const { searchTerm, categories, location } = filters;
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination;
    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    const whereClause: Prisma.UserWhereInput = {
      isCompany: true,
      // Exclude the current user from the list of companies if logged in
      id: currentUserId ? { not: currentUserId } : undefined,
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
    if (categories && categories.length > 0) {
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
    // Use transaction for count + findMany
    const [totalCount, companiesRaw] = await prisma.$transaction([
        // 1. Get total count matching filters
        prisma.user.count({ where: whereClause }),
        // 2. Get companies for the current page, including follow status check
        prisma.user.findMany({
            where: whereClause,
            select: {
                ...companyDataSelectBase, // Select base fields
                // Include 'followers' relation specifically filtered for the current user
                // If currentUserId is null, this where clause effectively finds nothing
                followers: {
                    where: {
                        followerId: currentUserId ?? undefined
                    },
                    select: {
                        followerId: true // We only need to know if this record exists
                    }
                }
            },
            orderBy: { name: "asc" }, // Or desired order
            skip: (currentPage - 1) * currentPageSize,
            take: currentPageSize,
        })
    ]);

    // --- Process results to add 'isFollowing' boolean ---
    // Map over the raw results to transform the nested followers array into the boolean
    const companies: CompanyCardData[] = companiesRaw.map(company => {
        // Determine if the current user is following this company
        const isFollowing = !!currentUserId && company.followers.length > 0;
        // Return a new object excluding the temporary 'followers' check array
        // and adding the 'isFollowing' boolean
        const { followers, ...restOfCompany } = company; // Destructure to remove 'followers'
        return {
            ...restOfCompany,
            isFollowing,
        };
    });

    // --- Calculate Pagination Metadata ---
    const totalPages = Math.ceil(totalCount / currentPageSize);
    const hasNextPage = currentPage < totalPages;

    console.log(`Fetched Page: ${currentPage}, PageSize: ${currentPageSize}, TotalCount: ${totalCount}, HasNext: ${hasNextPage}`);

    // --- Return Paginated Response ---
    return {
        success: true, // Indicate success
        companies, // Return processed companies with isFollowing
        totalCount,
        currentPage,
        pageSize: currentPageSize,
        hasNextPage,
    };

  } catch (error: unknown) {
    console.error("Error fetching filtered companies:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Return error state
    return {
        success: false, // Indicate failure
        error: `Failed to fetch companies: ${errorMessage}`,
        companies: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        hasNextPage: false,
    };
  }
}
