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
import { CompanyFilters, ViewMode } from './CompanyFilters';
import CompanyResults from './CompanyResults';
import { ExplorePostsList } from './ExplorePostsList';
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
  dbUserId: string | null; // Add dbUserId prop
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
  dbUserId, // Add dbUserId prop
}: ExploreClientWrapperProps) {
  const [companies, setCompanies] = useState<CompanyCardData[]>(initialCompanies);
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [isFiltering, startFilteringTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>('list');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles filter changes and triggers refetching of filtered data.
   */
  const handleFilterChange = useCallback(
    (newFilters: CompanyFiltersType & { viewMode: ViewMode }) => {
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
   * Handles view mode changes from CompanyFilters.
   */
  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setCurrentViewMode(newViewMode);
    // Potentially reset filters or refetch data based on view mode change
    // For now, just update the mode and let filters apply to the new mode
    // You might want to trigger a new data fetch here if the view mode implies a different dataset
    // e.g., if 'posts' view needs to fetch all posts immediately upon switching.
    // For now, we'll assume filters are reapplied by the user or another action.
    console.log('View mode changed to:', newViewMode);
    // Example: Trigger a refetch if needed
    // handleFilterChange({ ...appliedFilters, viewMode: newViewMode });
  }, []);

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
  }, [hasNextPage, isLoadingMore, isFiltering, currentPage, appliedFilters]);

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

  return (
    <div className="space-y-6">
      <CompanyFilters
        allCategories={allCategories}
        currentViewMode={currentViewMode}
        onViewModeChange={handleViewModeChange}
        onFilterChange={handleFilterChange}
        isLoading={isCurrentlyLoadingFilters}
        initialSearchTerm={appliedFilters.searchTerm}
        initialLocation={appliedFilters.location}
        initialCategories={appliedFilters.categories}
      />
      {currentViewMode === 'list' ? (
        <CompanyResults
          companies={companies}
          isLoading={isFiltering && companies.length === 0}
          dbUserId={dbUserId}
        />
      ) : (
        <ExplorePostsList 
          dbUserId={dbUserId} 
          filters={appliedFilters}
        />
      )}
      {currentViewMode === 'list' && (
        <>
          <div ref={sentinelRef} style={{ height: '10px' }} /> {/* Invisible sentinel */}
          <div className="flex justify-center py-4">
            {isLoadingMore && ( // Show loader only when loading more pages
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
