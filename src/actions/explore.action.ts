// src/actions/explore.action.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define the structure for filter parameters
export interface CompanyFiltersType {
  searchTerm?: string;
  category?: string;
  location?: string;
}

// Define the type for the company data we expect to return
const companyDataSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  username: true,
  image: true,
  location: true,
  categories: true, // Keep fetching categories for display on cards
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

export async function getFilteredCompanies(
  filters: CompanyFiltersType
): Promise<CompanyCardData[]> {
  try {
    const { searchTerm, category, location } = filters;

    const whereClause: Prisma.UserWhereInput = {
      isCompany: true,
      AND: [],
    };

    // Add filters conditionally
    if (searchTerm) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { bio: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    if (category) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        categories: { has: category },
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

    const companies = await prisma.user.findMany({
      where: whereClause,
      select: companyDataSelect,
      orderBy: {
        createdAt: "desc",
      },
      // take: 20, // Consider adding pagination later
    });

    return companies;
  } catch (error) {
    console.error("Error fetching filtered companies:", error);
    return [];
  }
}

// REMOVED the getDistinctCompanyCategories function entirely
// as we are now using a static list from constants.
