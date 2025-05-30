/**
 * Homepage component that serves as the main entry point for the Glooba application.
 * Provides a company exploration interface with filtering capabilities and a welcome message for new users.
 *
 * @fileoverview Main application page that handles initial data fetching and user authentication.
 */

/**
 * Imports and type definitions for the homepage component.
 */
import {
  getFilteredCompanies,
  PaginatedCompaniesResponse,
} from "@/actions/explore.action";
import ExploreClientWrapper from "@/components/explore/ExploreClientWrapper";
import WelcomeMessage from "@/components/WelcomeMessage";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import { currentUser } from "@clerk/nextjs/server";
import { getDbUserId } from "@/actions/user.action";
import { Suspense } from "react";
import { HeartHandshake } from 'lucide-react';

/**
 * Metadata configuration for the homepage.
 * Provides SEO and OpenGraph information for better search engine visibility and social sharing.
 */

export const metadata = {
  title: "Explora Alternativas Sostenibles | Glooba",
  description:
    "Descubre y conecta con empresas sostenibles en Glooba, la red social de la sostenibilidad.",
  keywords: [
    "sostenibilidad",
    "empresas sostenibles",
    "red social",
    "ecológico",
    "Glooba",
  ],
  openGraph: {
    title: "Explora Alternativas Sostenibles | Glooba",
    description: "Descubre y conecta con empresas sostenibles en Glooba.",
    url: "https://www.glooba.cl",
    siteName: "Glooba",
    type: "website",
  },
  robots: { index: true, follow: true },
  authors: [{ name: "Glooba", url: "https://www.glooba.cl" }],
};

/**
 * Loading skeleton component that provides a smooth user experience during data fetching.
 * Displays animated placeholders for filters and company cards while the actual content loads.
 *
 * @returns A responsive skeleton UI that matches the final layout structure.
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton for Filters */}
      <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm h-[100px] animate-pulse"></div>
      {/* Skeleton for Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card border rounded-lg shadow-sm h-[250px] animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main homepage component that handles initial data fetching and user authentication.
 * Conditionally renders either a welcome message or the company exploration interface based on user authentication status.
 *
 * @returns A server component that renders either a welcome message or the company exploration interface.
 * @async
 * @throws {Error} If there's an issue fetching company data or user authentication fails.
 */
export default async function HomePage() {
  // Fetch authenticated user data (if logged in)
  const user = await currentUser(); // Keep this to check if user is logged in at all
  // Call getDbUserId to get the database ID, returns null if not logged in
  const dbUserId = await getDbUserId();

  /**
   * Fetch initial company data for the explore section.
   * Uses try/catch for robust error handling on initial server load.
   * Provides fallback values if data fetching fails.
   */
  let initialData: PaginatedCompaniesResponse;
  try {
    initialData = await getFilteredCompanies(
      {}, // No initial filters
      { page: 1 } // Fetch page 1
    );
    // Handle potential error returned from the action itself
    if (!initialData.success) {
      console.error("Error fetching initial companies:", initialData.error);
      // Set defaults or throw error depending on desired behavior
      initialData = {
        success: false,
        error: initialData.error,
        companies: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 12,
        hasNextPage: false,
      };
    }
  } catch (error) {
    console.error("Critical error fetching initial companies:", error);
    initialData = {
      success: false,
      error: "Could not load companies.",
      companies: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 12,
      hasNextPage: false,
    };
  }

  const allCategories = COMPANY_CATEGORIES;

  return (
    <div>
      {!user && (
        <div>
          <WelcomeMessage />
        </div>
      )}

      <div className="px-4 space-y-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HeartHandshake className="h-4 w-4" />
          <a href="/feedback" className="inline-block">
            Ayudanos a crecer y <span className="underline">deja tu feedback acá</span>
          </a>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ExploreClientWrapper
          initialCompanies={initialData.companies} // Pass first page results
          initialTotalCount={initialData.totalCount} // Pass total count
          initialHasNextPage={initialData.hasNextPage} // Pass hasNextPage
          allCategories={allCategories}
          dbUserId={dbUserId} // Pass the extracted dbUserId here
        />
      </Suspense>
    </div>
  );
}
