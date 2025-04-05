// src/actions/explore.action.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define the structure for filter parameters - UPDATED for multi-category
export interface CompanyFiltersType {
  searchTerm?: string;
  categories?: string[]; // Changed to array
  location?: string;
}

// Define the type for the company data we expect to return
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

export async function getFilteredCompanies(
  filters: CompanyFiltersType // Accepts the updated type
): Promise<CompanyCardData[]> {
  try {
    // Destructure updated 'categories' array
    const { searchTerm, categories, location } = filters;

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

    // UPDATED: Handle categories array filter using 'hasSome'
    if (categories && categories.length > 0) {
      (whereClause.AND as Prisma.UserWhereInput[]).push({
        categories: { hasSome: categories }, // Filter if company has ANY of the selected categories
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

    console.log("Prisma Query Where Clause:", JSON.stringify(whereClause, null, 2)); // Debug log

    const companies = await prisma.user.findMany({
      where: whereClause,
      select: companyDataSelect,
      orderBy: {
        name: "asc", // Example ordering
      },
    });

    return companies;
  } catch (error) {
    console.error("Error fetching filtered companies:", error);
    return [];
  }
}
