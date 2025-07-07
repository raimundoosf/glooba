/**
 * @module ExploreClientWrapper
 * Main wrapper component for company exploration with filtering and infinite scrolling.
 */
"use client";

import { ScopeType } from "@prisma/client";
import {
  CompanyCardData,
  CompanyFiltersType,
  getFilteredCompanies,
  PaginatedCompaniesResponse,
  SortOption,
} from "@/actions/explore.action";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CompanyFilters, ViewMode } from "./CompanyFilters";
import CompanyResults from "./CompanyResults";
import { ExplorePostsList } from "./ExplorePostsList";
import { Loader2 } from "lucide-react";

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
/**
 * Parses company filters from URL search parameters.
 * @param {URLSearchParams} params - The URL search parameters.
 * @returns {CompanyFiltersType} The parsed filters.
 */
const parseFiltersFromParams = (
  params: URLSearchParams
): CompanyFiltersType => {
  const filters: CompanyFiltersType = {
    searchTerm: params.get("searchTerm")?.trim() || undefined,
    location: params.get("location")?.trim() || undefined,
    categories: params.get("categories")
      ? params
          .get("categories")!
          .split(",")
          .map((c) => decodeURIComponent(c.trim()))
          .filter(Boolean)
      : undefined,
    sortBy: (params.get("sortBy") as SortOption) || "newest",
    // Leer los parámetros de alcance de la URL
    scope: (params.get("scope") as ScopeType) || undefined,
    regions: params.get("regions")
      ? params.get("regions")!.split(",").filter(Boolean)
      : undefined,
    communes: params.get("communes")
      ? params.get("communes")!.split(",").filter(Boolean)
      : undefined,
  };
  if (filters.categories && filters.categories.length === 0) {
    filters.categories = undefined;
  }
  return filters;
};

export default function ExploreClientWrapper({
  initialCompanies,
  initialTotalCount,
  initialHasNextPage,
  allCategories,
  dbUserId, // Add dbUserId prop
}: ExploreClientWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [companies, setCompanies] =
    useState<CompanyCardData[]>(initialCompanies);
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>(
    () => {
      if (typeof window !== "undefined") {
        const initialUrlParams = new URLSearchParams(window.location.search);
        const filtersFromUrl = parseFiltersFromParams(initialUrlParams);
        const hasUrlFilters = Object.keys(filtersFromUrl).some((key) => {
          const value = filtersFromUrl[key as keyof CompanyFiltersType];
          if (key === "sortBy") return value !== "newest";
          return (
            value !== undefined &&
            (Array.isArray(value) ? value.length > 0 : true)
          );
        });
        if (hasUrlFilters) {
          return filtersFromUrl;
        }
      }
      return { sortBy: "newest" }; // Default filters
    }
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [isFiltering, startFilteringTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>("list");
  const [isDataInitializedFromUrl, setIsDataInitializedFromUrl] =
    useState<boolean>(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Effect to synchronize filters from URL to state
  useEffect(() => {
    const filtersFromUrl = parseFiltersFromParams(searchParams);

    // Normalize appliedFilters for comparison (empty array to undefined)
    const currentFiltersForComparison = { ...appliedFilters };
    if (
      currentFiltersForComparison.categories &&
      currentFiltersForComparison.categories.length === 0
    ) {
      currentFiltersForComparison.categories = undefined;
    }

    if (
      JSON.stringify(filtersFromUrl) !==
      JSON.stringify(currentFiltersForComparison)
    ) {
      setAppliedFilters(filtersFromUrl);
      setCurrentPage(1); // Reset to page 1 when URL filters are applied externally
      setCompanies([]); // Clear companies to show loading or new results
      setHasNextPage(false); // Reset pagination
      setIsDataInitializedFromUrl(true); // Mark that data will be fetched based on URL params
    }
  }, [searchParams]); // Removed appliedFilters from deps

  /**
   * Handles filter changes from the CompanyFilters component and updates the URL.
   */
  const handleFilterChange = useCallback(
    (newFiltersFromComponent: CompanyFiltersType & { viewMode: ViewMode }) => {
      const filtersToApply: CompanyFiltersType = {
        searchTerm: newFiltersFromComponent.searchTerm?.trim() || undefined,
        categories:
          newFiltersFromComponent.categories &&
          newFiltersFromComponent.categories.length > 0
            ? newFiltersFromComponent.categories
            : undefined,
        location: newFiltersFromComponent.location?.trim() || undefined,
        sortBy: newFiltersFromComponent.sortBy || "newest",
        scope: newFiltersFromComponent.scope,
        regions: newFiltersFromComponent.regions,
        communes: newFiltersFromComponent.communes,
      };

      const params = new URLSearchParams();
      if (filtersToApply.searchTerm)
        params.set("searchTerm", filtersToApply.searchTerm);
      if (filtersToApply.location)
        params.set("location", filtersToApply.location);
      if (filtersToApply.categories && filtersToApply.categories.length > 0) {
        params.set(
          "categories",
          filtersToApply.categories.map((c) => encodeURIComponent(c)).join(",")
        );
      }
      if (filtersToApply.sortBy) params.set("sortBy", filtersToApply.sortBy);
      if (filtersToApply.scope) params.set("scope", filtersToApply.scope);
      if (filtersToApply.regions && filtersToApply.regions.length > 0) {
        params.set("regions", filtersToApply.regions.join(","));
      }
      if (filtersToApply.communes && filtersToApply.communes.length > 0) {
        params.set("communes", filtersToApply.communes.join(","));
      }

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router, pathname]
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
    console.log("View mode changed to:", newViewMode);
    // Example: Trigger a refetch if needed
    // handleFilterChange({ ...appliedFilters, viewMode: newViewMode });
  }, []);

  // Effect to fetch/refetch data when appliedFilters or currentPage changes
  useEffect(() => {
    // Guard against running on server or if essential parts aren't ready.
    if (typeof window === "undefined") return;

    const filtersAreDefault =
      JSON.stringify(appliedFilters) === JSON.stringify({ sortBy: "newest" });

    // If initial load, no URL params (filtersAreDefault), initialCompanies are provided, and we haven't fetched based on URL yet.
    if (
      currentPage === 1 &&
      filtersAreDefault &&
      initialCompanies.length > 0 &&
      !isDataInitializedFromUrl
    ) {
      setCompanies(initialCompanies);
      setTotalCount(initialTotalCount);
      setHasNextPage(initialHasNextPage);
      // setIsDataInitializedFromUrl remains false, so if user applies filters then comes back to default, it will fetch.
      return; // Use server-passed initial data
    }

    // Proceed with fetching
    startFilteringTransition(async () => {
      const loadingForPageOne = currentPage === 1;
      if (loadingForPageOne) {
        // Handled by isFiltering transition state if needed for skeletons
      } else {
        setIsLoadingMore(true);
      }

      try {
        const results = await getFilteredCompanies(appliedFilters, {
          page: currentPage,
        });
        if (currentPage === 1) {
          setCompanies(results.companies);
        } else {
          setCompanies((prevCompanies) => {
            const newCompanies = results.companies.filter(
              (newCompany) =>
                !prevCompanies.some(
                  (prevCompany) => prevCompany.id === newCompany.id
                )
            );
            return [...prevCompanies, ...newCompanies];
          });
        }
        setTotalCount(results.totalCount);
        setHasNextPage(results.hasNextPage);
        // setCurrentPage is already managed by filter changes (reset to 1) or loadMore (incremented)
      } catch (error) {
        console.error(
          "Failed to fetch companies based on filters/page:",
          error
        );
        if (currentPage === 1) {
          setCompanies([]);
          setTotalCount(0);
        }
        setHasNextPage(false); // Stop pagination on error
      } finally {
        if (!loadingForPageOne) {
          setIsLoadingMore(false);
        }
        setIsDataInitializedFromUrl(true); // Mark that a fetch attempt (or use of initial data) has occurred.
      }
    });
  }, [
    appliedFilters,
    currentPage,
    initialCompanies,
    initialTotalCount,
    initialHasNextPage,
    isDataInitializedFromUrl,
    startFilteringTransition,
  ]);

  /**
   * Increments current page to load more companies for infinite scroll.
   */
  const loadMoreCompanies = useCallback(() => {
    if (isLoadingMore || isFiltering || !hasNextPage) return;
    setCurrentPage((prevPage) => prevPage + 1);
    // The useEffect listening to appliedFilters & currentPage will handle the fetch.
  }, [hasNextPage, isLoadingMore, isFiltering]);

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
      if (
        entries[0].isIntersecting &&
        hasNextPage &&
        !isLoadingMore &&
        !isFiltering
      ) {
        console.log("Sentinel intersecting, loading more..."); // Debug log
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
    // Re-run effect if these dependencies change, ensuring observer is correctly managed.
  }, [
    hasNextPage,
    isLoadingMore,
    isFiltering,
    loadMoreCompanies,
    appliedFilters,
  ]); // Added appliedFilters

  // Combined loading state for disabling filters during any loading operation
  // isFiltering is true during startFilteringTransition for page 1 fetches.
  // isLoadingMore is true for subsequent page fetches.
  const isCurrentlyLoadingFilters =
    isFiltering || (isLoadingMore && currentPage > 1);

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
        initialSortBy={appliedFilters.sortBy}
      />
      {currentViewMode === "list" ? (
        <CompanyResults
          companies={companies}
          isLoading={isFiltering && companies.length === 0}
          dbUserId={dbUserId}
        />
      ) : (
        <ExplorePostsList
          dbUserId={dbUserId}
          filters={{
            searchTerm: appliedFilters.searchTerm,
            categories: appliedFilters.categories,
            location: appliedFilters.location,
            sortBy: appliedFilters.sortBy,
          }}
        />
      )}
      {currentViewMode === "list" && (
        <>
          <div ref={sentinelRef} style={{ height: "10px" }} />{" "}
          {/* Invisible sentinel */}
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
