// src/components/explore/ExploreClientWrapper.tsx
"use client";

import { useState, useTransition, useCallback } from "react";
import CompanyFilters from "./CompanyFilters";
import CompanyResults from "./CompanyResults";
import { getFilteredCompanies, CompanyFiltersType, CompanyCardData } from "@/actions/explore.action";

interface ExploreClientWrapperProps {
  initialCompanies: CompanyCardData[];
  allCategories: string[];
}

export default function ExploreClientWrapper({
  initialCompanies,
  allCategories,
}: ExploreClientWrapperProps) {
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyCardData[]>(initialCompanies);
  const [isPending, startTransition] = useTransition();
  // Track applied filters
  const [appliedFilters, setAppliedFilters] = useState<CompanyFiltersType>({});

  const handleFilterChange = useCallback((newFilters: CompanyFiltersType) => {
    setAppliedFilters(newFilters); // Update applied filters state
    startTransition(async () => {
      try {
        const results = await getFilteredCompanies(newFilters);
        setFilteredCompanies(results);
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
        setFilteredCompanies([]);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <CompanyFilters
        allCategories={allCategories}
        appliedFilters={appliedFilters}
        onFilterChange={handleFilterChange}
        isDisabled={isPending}
      />
      <CompanyResults companies={filteredCompanies} isLoading={isPending} />
    </div>
  );
}
