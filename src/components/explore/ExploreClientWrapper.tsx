// src/components/explore/ExploreClientWrapper.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import CompanyFilters from "./CompanyFilters";
import CompanyResults from "./CompanyResults";
// Import the updated types and action
import { getFilteredCompanies, CompanyFiltersType, CompanyCardData, PaginatedCompaniesResponse } from "@/actions/explore.action";
import { Button } from "@/components/ui/button"; // Import Button
import { Loader2 } from "lucide-react"; // Import Loader

interface ExploreClientWrapperProps {
  initialCompanies: CompanyCardData[];
  initialTotalCount: number;
  initialHasNextPage: boolean;
  allCategories: string[];
}

export default function ExploreClientWrapper({
  initialCompanies,
  initialTotalCount,
  initialHasNextPage,
  allCategories,
}: ExploreClientWrapperProps) {
  // --- State ---
  const [companies, setCompanies] = useState<CompanyCardData[]>(initialCompanies); // Accumulates results
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  // Loading state for initial filter/search actions
  const [isFiltering, startFilteringTransition] = useTransition();
  // Separate loading state for "Load More" button actions
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // --- Handlers ---

  // Called when filters change in CompanyFilters
  const handleFilterChange = useCallback((newFilters: CompanyFiltersType) => {
    const filtersToApply: CompanyFiltersType = {
       searchTerm: newFilters.searchTerm || undefined,
       categories: newFilters.categories && newFilters.categories.length > 0 ? newFilters.categories : undefined,
       location: newFilters.location || undefined,
     };

    setAppliedFilters(filtersToApply);
    setCurrentPage(1); // Reset to page 1 when filters change
    setCompanies([]); // Clear existing results immediately
    setHasNextPage(false); // Assume no next page until fetch confirms

    startFilteringTransition(async () => { // Use transition for filter loading state
      try {
        console.log("Applying filters (Page 1):", filtersToApply);
        const results: PaginatedCompaniesResponse = await getFilteredCompanies(
            filtersToApply,
            { page: 1 } // Fetch page 1
        );
        setCompanies(results.companies); // Set results for the first page
        setTotalCount(results.totalCount);
        setHasNextPage(results.hasNextPage);
        setCurrentPage(results.currentPage); // Should be 1
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
        setCompanies([]); // Clear results on error
        setTotalCount(0);
        setHasNextPage(false);
      }
    });
  }, [startFilteringTransition]); // Include transition function in dependencies

  // Called when "Load More" button is clicked
  const loadMoreCompanies = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || isFiltering) return; // Prevent multiple calls

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      console.log(`Loading more (Page ${nextPage}):`, appliedFilters);
      const results: PaginatedCompaniesResponse = await getFilteredCompanies(
          appliedFilters,
          { page: nextPage }
      );
      // Append new results to existing ones
      setCompanies((prevCompanies) => [...prevCompanies, ...results.companies]);
      setTotalCount(results.totalCount); // Update total count (might change)
      setHasNextPage(results.hasNextPage);
      setCurrentPage(results.currentPage); // Update current page
    } catch (error) {
      console.error("Failed to load more companies:", error);
      // Optionally show a toast message to the user
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, isFiltering, currentPage, appliedFilters]); // Dependencies for loadMore

  // Combined loading state for disabling filters etc.
  const isCurrentlyLoading = isFiltering || isLoadingMore;

  return (
    <div className="space-y-6">
      <CompanyFilters
        allCategories={allCategories}
        appliedFilters={appliedFilters} // Pass applied filters for potential initialization needs
        onFilterChange={handleFilterChange}
        isDisabled={isCurrentlyLoading} // Disable filters while any loading is happening
      />

      {/* Display results - show spinner only during initial filtering */}
      <CompanyResults companies={companies} isLoading={isFiltering && companies.length === 0} />

      {/* "Load More" Button */}
      <div className="flex justify-center pt-4">
        {hasNextPage && ( // Only show if there are more pages
          <Button
            onClick={loadMoreCompanies}
            disabled={isCurrentlyLoading} // Disable if filtering or loading more
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar Más Organizaciones"
            )}
          </Button>
        )}
        {/* Optional: Show message when loading is done and no more pages */}
        {!hasNextPage && companies.length > 0 && !isCurrentlyLoading && (
             <p className="text-sm text-muted-foreground">Has llegado al final.</p>
        )}
      </div>
    </div>
  );
}
