// src/components/explore/CompanyFilters.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanyFiltersType } from "@/actions/explore.action"; // Uses { categories?: string[] }
import { X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { MultiSelectCategories } from "@/components/MultiSelectCategories"; 

interface CompanyFiltersProps {
  allCategories: string[];
  appliedFilters: CompanyFiltersType;
  onFilterChange: (filters: CompanyFiltersType) => void;
  isDisabled?: boolean;
}

export default function CompanyFilters({
  allCategories,
  appliedFilters, // Used only for initial state setting
  onFilterChange,
  isDisabled = false,
}: CompanyFiltersProps) {
  // --- Local State for Inputs ---
  const [searchInput, setSearchInput] = useState(appliedFilters.searchTerm || "");
  const [locationInput, setLocationInput] = useState(appliedFilters.location || "");
  // Local state for selected categories (stores strings)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(appliedFilters.categories || []);

  // --- Function to apply all current filters ---
  // Called explicitly by Enter key for text inputs
  const applyFilters = useCallback(() => {
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  }, [searchInput, locationInput, selectedCategories, onFilterChange]);

  // --- Handlers ---

  // Handle Enter key press in text inputs
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters(); // Apply filters explicitly
    }
  };

   // Handle category changes immediately from MultiSelectCategories
   const handleCategoriesChange = (newSelection: string[]) => {
       setSelectedCategories(newSelection); // Update local state immediately

       // Apply filters immediately when categories change
       onFilterChange({
           searchTerm: searchInput.trim() || undefined,
           location: locationInput.trim() || undefined,
           categories: newSelection.length > 0 ? newSelection : undefined,
       });
   };

  // Reset all filters
  const handleReset = () => {
    setSearchInput("");
    setLocationInput("");
    setSelectedCategories([]); // Reset categories array
    onFilterChange({}); // Trigger update with empty filters
  };

  // Check if any filter is active (using local state)
  const hasActiveFilters = !!(
    searchInput.trim() ||
    selectedCategories.length > 0 ||
    locationInput.trim()
  );

  return (
    <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

        {/* Search Input */}
        <div className="space-y-1">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Nombre, usuario, bio..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown} // Trigger on Enter
            disabled={isDisabled}
          />
        </div>

        {/* === ShadCN MultiSelect for Categories === */}
        <div className="space-y-1">
           <Label>Categorías</Label>
           <MultiSelectCategories
               allCategories={allCategories}
               selectedCategories={selectedCategories}
               onChange={handleCategoriesChange} // Triggers filter immediately
               placeholder="Filtrar por categorías..."
               disabled={isDisabled}
               className="w-full" // Ensure it takes full width
               // No maxSelection needed for filtering
           />
        </div>
        {/* === End ShadCN MultiSelect === */}

        {/* Location Input */}
        <div className="space-y-1">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            placeholder="Filtrar por ubicación..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleKeyDown} // Trigger on Enter
            disabled={isDisabled}
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end h-full">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!hasActiveFilters || isDisabled}
            className="w-full sm:w-auto mt-auto"
          >
            {isDisabled ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Resetear
          </Button>
        </div>
      </div>
    </div>
  );
}
