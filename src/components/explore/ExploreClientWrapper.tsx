// src/components/explore/ExploreClientWrapper.tsx
'use client';

import {
  CompanyCardData,
  CompanyFiltersType,
  getFilteredCompanies,
  PaginatedCompaniesResponse,
} from '@/actions/explore.action';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'; // Added useRef, useEffect
import CompanyFilters from './CompanyFilters';
import CompanyResults from './CompanyResults';
// Removed Button import as Load More button is gone
import { Loader2 } from 'lucide-react'; // Keep Loader for indicator

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
  const [companies, setCompanies] = useState<CompanyCardData[]>(initialCompanies);
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});
  const [currentPage, setCurrentPage] = useState<number>(1); // Start at page 1
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [isFiltering, startFilteringTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // --- Ref for Intersection Observer ---
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null); // Ref for the element to observe

  // --- Handlers ---

  // Called when filters change
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
      setCurrentPage(1); // Reset to page 1
      setCompanies([]); // Clear existing results
      setHasNextPage(false); // Reset hasNextPage

      startFilteringTransition(async () => {
        try {
          console.log('Applying filters (Page 1):', filtersToApply);
          const results: PaginatedCompaniesResponse = await getFilteredCompanies(filtersToApply, {
            page: 1,
          });
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

  // Function to load the next page of companies
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

  // Combined loading state for disabling filters
  const isCurrentlyLoadingFilters = isFiltering || isLoadingMore;

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
