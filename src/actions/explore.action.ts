// src/actions/explore.action.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// --- Constants ---
const DEFAULT_PAGE_SIZE = 3; // Number of companies per page

// --- Types ---
export interface CompanyFiltersType {
  searchTerm?: string;
  categories?: string[];
  location?: string;
}

// Type for pagination parameters
export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

const companyDataSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  username: true,
  image: true,
  location: true,
  categories: true,
  bio: true,
  _count: {
    select: {
      followers: true,
    },
  },
});

export type CompanyCardData = Prisma.UserGetPayload<{
  select: typeof companyDataSelect;
}>;

// Define the return type including pagination info
export interface PaginatedCompaniesResponse {
    companies: CompanyCardData[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
}

// --- Action Function ---
export async function getFilteredCompanies(
  filters: CompanyFiltersType,
  pagination: PaginationOptions = {} // Accept pagination options
): Promise<PaginatedCompaniesResponse> {
  try {
    const { searchTerm, categories, location } = filters;
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = pagination; // Default to page 1

    // Ensure page and pageSize are positive integers
    const currentPage = Math.max(1, Math.floor(page));
    const currentPageSize = Math.max(1, Math.floor(pageSize));

    const whereClause: Prisma.UserWhereInput = {
      isCompany: true,
      AND: [],
    };

    // --- Apply Filters (same as before) ---
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


    // --- Perform Queries in Parallel ---
    const [totalCount, companies] = await prisma.$transaction([
        // 1. Get total count matching filters
        prisma.user.count({ where: whereClause }),
        // 2. Get companies for the current page
        prisma.user.findMany({
            where: whereClause,
            select: companyDataSelect,
            orderBy: {
                name: "asc", // Or desired order
            },
            // Apply pagination
            skip: (currentPage - 1) * currentPageSize,
            take: currentPageSize,
        })
    ]);

    // --- Calculate Pagination Metadata ---
    const totalPages = Math.ceil(totalCount / currentPageSize);
    const hasNextPage = currentPage < totalPages;

    console.log(`Fetched Page: ${currentPage}, PageSize: ${currentPageSize}, TotalCount: ${totalCount}, HasNext: ${hasNextPage}`); // Debug log

    // --- Return Paginated Response ---
    return {
        companies,
        totalCount,
        currentPage,
        pageSize: currentPageSize,
        hasNextPage,
    };

  } catch (error) {
    console.error("Error fetching filtered companies:", error);
    // Return an empty state on error
    return {
        companies: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        hasNextPage: false,
    };
  }
}
