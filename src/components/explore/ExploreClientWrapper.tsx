// src/components/explore/ExploreClientWrapper.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import CompanyFilters from "./CompanyFilters";
import CompanyResults from "./CompanyResults";
// Import the updated types and action
import { getFilteredCompanies, CompanyFiltersType, CompanyCardData } from "@/actions/explore.action";

interface ExploreClientWrapperProps {
  initialCompanies: CompanyCardData[];
  allCategories: string[]; // Comes from static list
}

export default function ExploreClientWrapper({
  initialCompanies,
  allCategories,
}: ExploreClientWrapperProps) {
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyCardData[]>(initialCompanies);
  const [isPending, startTransition] = useTransition();
  // Track applied filters - uses the updated CompanyFiltersType
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});

  const handleFilterChange = useCallback((newFilters: CompanyFiltersType) => {
    // Prepare filters, ensuring empty arrays become undefined if needed by backend logic
    // (Our current backend handles empty arrays fine, so direct pass is okay)
     const filtersToApply: CompanyFiltersType = {
       searchTerm: newFilters.searchTerm || undefined,
       categories: newFilters.categories && newFilters.categories.length > 0 ? newFilters.categories : undefined,
       location: newFilters.location || undefined,
     };

    setAppliedFilters(filtersToApply); // Update state tracking applied filters
    startTransition(async () => {
      try {
        console.log("Applying filters:", filtersToApply); // Debug log
        const results = await getFilteredCompanies(filtersToApply);
        setFilteredCompanies(results);
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
        setFilteredCompanies([]); // Clear results on error
      }
    });
  }, []); // Dependencies are stable

  return (
    <div className="space-y-6">
      <CompanyFilters
        allCategories={allCategories}
        // Pass the current applied filters (potentially with categories array)
        // Note: CompanyFilters uses this only for initialization now
        appliedFilters={appliedFilters}
        onFilterChange={handleFilterChange} // Pass the callback
        isDisabled={isPending} // Disable filters while loading results
      />
      <CompanyResults companies={filteredCompanies} isLoading={isPending} />
    </div>
  );
}
