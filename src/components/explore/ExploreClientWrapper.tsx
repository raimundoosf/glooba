/**
 * @module ExploreClientWrapper
 * Main wrapper component for company exploration with filtering and infinite scrolling.
 */
'use client';

import {
  CompanyCardData,
  CompanyFiltersType,
  getFilteredCompanies,
  PaginatedCompaniesResponse,
} from '@/actions/explore.action';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import CompanyFilters from './CompanyFilters';
import CompanyResults from './CompanyResults';
import { Loader2 } from 'lucide-react';

/**
 * Props interface for the ExploreClientWrapper component
 * @interface ExploreClientWrapperProps
 */
interface ExploreClientWrapperProps {
  initialCompanies: CompanyCardData[];
  initialTotalCount: number;
  initialHasNextPage: boolean;
  allCategories: string[];
}

/**
 * Main wrapper component for company exploration with filtering and infinite scrolling.
 * @param {ExploreClientWrapperProps} props - Component props
 * @returns {JSX.Element} The explore wrapper with filters and results
 */
export default function ExploreClientWrapper({
  initialCompanies,
  initialTotalCount,
  initialHasNextPage,
  allCategories,
}: ExploreClientWrapperProps) {
  const [companies, setCompanies] = useState<CompanyCardData[]>(initialCompanies);
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [isFiltering, startFilteringTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles filter changes and triggers refetching of filtered data.
   */
  const handleFilterChange = useCallback(
    (newFilters: CompanyFiltersType) => {
      const filtersToApply: CompanyFiltersType = {
        searchTerm: newFilters.searchTerm || undefined,
        categories:
          newFilters.categories && newFilters.categories.length > 0
            ? newFilters.categories
            : undefined,
        location: newFilters.location || undefined,
      };

      setAppliedFilters(filtersToApply);
      setCurrentPage(1);
      setCompanies([]);
      setHasNextPage(false);

      startFilteringTransition(async () => {
        try {
          const results = await getFilteredCompanies(filtersToApply, { page: 1 });
          setCompanies(results.companies);
          setTotalCount(results.totalCount);
          setHasNextPage(results.hasNextPage);
          setCurrentPage(results.currentPage);
        } catch (error) {
          console.error('Failed to fetch filtered companies:', error);
          setCompanies([]);
          setTotalCount(0);
          setHasNextPage(false);
        }
      });
    },
    [startFilteringTransition]
  );

  /**
   * Fetches and appends the next page of companies when triggered by infinite scroll.
   * Handles loading states, error handling, and data appending.
   */
  const loadMoreCompanies = useCallback(async () => {
    // Prevent fetching if already loading or no more pages
    if (isLoadingMore || isFiltering || !hasNextPage) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      console.log(`Loading more (Page ${nextPage}):`, appliedFilters);
      const results: PaginatedCompaniesResponse = await getFilteredCompanies(appliedFilters, {
        page: nextPage,
      });
      setCompanies((prevCompanies) => [...prevCompanies, ...results.companies]);
      setTotalCount(results.totalCount);
      setHasNextPage(results.hasNextPage);
      setCurrentPage(results.currentPage);
    } catch (error) {
      console.error('Failed to load more companies:', error);
      // Consider showing an error message to the user
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, isFiltering, currentPage, appliedFilters]); // Add loadMoreCompanies itself? No, it causes infinite loop if added.

  /**
   * Effect that sets up and manages the Intersection Observer for infinite scrolling.
   * When the sentinel element becomes visible, it triggers loading of more companies.
   */
  // --- Effect for Intersection Observer ---
  useEffect(() => {
    // Ensure observer isn't created multiple times unnecessarily
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      // Check if the sentinel element is intersecting (visible)
      if (entries[0].isIntersecting && hasNextPage && !isLoadingMore && !isFiltering) {
        console.log('Sentinel intersecting, loading more...'); // Debug log
        loadMoreCompanies(); // Load next page
      }
    });

    // Observe the sentinel element if it exists
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    // Cleanup function to disconnect observer on unmount or dependency change
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // Re-run effect if loading states or hasNextPage change, or if loadMoreCompanies function reference changes
  }, [hasNextPage, isLoadingMore, isFiltering, loadMoreCompanies]);

  // Combined loading state for disabling filters during any loading operation
  const isCurrentlyLoadingFilters = isFiltering || isLoadingMore;
  
  // NOTE: Consider extracting intersection observer logic to a custom hook for reusability

  return (
    <div className="space-y-6">
      <CompanyFilters
        allCategories={allCategories}
        appliedFilters={appliedFilters}
        onFilterChange={handleFilterChange}
        isDisabled={isCurrentlyLoadingFilters}
      />
      {/* Display results - show spinner only during initial filtering when results are empty */}
      <CompanyResults companies={companies} isLoading={isFiltering && companies.length === 0} />
      {/* Sentinel Element and Loading Indicator for Infinite Scroll */}
      <div ref={sentinelRef} style={{ height: '10px' }} /> {/* Invisible sentinel */}
      <div className="flex justify-center py-4">
        {isLoadingMore && ( // Show loader only when loading more pages
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </div>
  );
}
