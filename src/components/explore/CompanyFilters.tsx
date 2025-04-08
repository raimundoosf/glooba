// src/components/explore/CompanyFilters.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanyFiltersType } from "@/actions/explore.action";
import { X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { MultiSelectCategories } from "@/components/MultiSelectCategories"; // Import the updated component
import { Badge } from "@/components/ui/badge"; // Import Badge for rendering

interface CompanyFiltersProps {
  allCategories: string[];
  appliedFilters: CompanyFiltersType;
  onFilterChange: (filters: CompanyFiltersType) => void;
  isDisabled?: boolean;
}

export default function CompanyFilters({
  allCategories,
  appliedFilters,
  onFilterChange,
  isDisabled = false,
}: CompanyFiltersProps) {
  // --- Local State for Inputs ---
  const [searchInput, setSearchInput] = useState(appliedFilters.searchTerm || "");
  const [locationInput, setLocationInput] = useState(appliedFilters.location || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(appliedFilters.categories || []);

  // --- Function to apply all current filters ---
  const applyFilters = useCallback(() => {
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  }, [searchInput, locationInput, selectedCategories, onFilterChange]);

  // --- Handlers ---

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
    }
  };

   // Handle category changes from MultiSelectCategories
   const handleCategoriesChange = (newSelection: string[]) => {
       setSelectedCategories(newSelection); // Update local state immediately
       // Apply filters immediately when categories change
       onFilterChange({
           searchTerm: searchInput.trim() || undefined,
           location: locationInput.trim() || undefined,
           categories: newSelection.length > 0 ? newSelection : undefined,
       });
   };

   // Handle removing a category via its badge
   const handleRemoveCategory = (categoryToRemove: string) => {
       const newSelection = selectedCategories.filter(cat => cat !== categoryToRemove);
       setSelectedCategories(newSelection);
       // Apply filters immediately after removing a category badge
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
    setSelectedCategories([]);
    onFilterChange({});
  };

  // Check if any filter is active
  const hasActiveFilters = !!(
    searchInput.trim() ||
    selectedCategories.length > 0 ||
    locationInput.trim()
  );

  return (
    // Main container for filters + selected badges area
    <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm">

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

        {/* Search Input */}
        <div className="space-y-1">
          <Label htmlFor="search">Buscar</Label>
          <Input id="search" placeholder="Nombre, usuario, bio..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isDisabled} />
        </div>

        {/* MultiSelect for Categories (now just the button/popover) */}
        <div className="space-y-1">
           <Label>Categorías</Label>
           <MultiSelectCategories
               allCategories={allCategories}
               selectedCategories={selectedCategories} // Pass state for checkmarks
               onChange={handleCategoriesChange}       // Update state and trigger filter
               placeholder="Filtrar por categorías..."
               disabled={isDisabled}
               // className="w-full" // Applied within component now
           />
        </div>

        {/* Location Input */}
        <div className="space-y-1">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" placeholder="Filtrar por ubicación..." value={locationInput} onChange={(e) => setLocationInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isDisabled} />
        </div>

        {/* Reset Button */}
        <div className="flex items-end h-full">
          <Button variant="ghost" onClick={handleReset} disabled={!hasActiveFilters || isDisabled} className="w-full sm:w-auto mt-auto" >
            {isDisabled ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
            Resetear
          </Button>
        </div>
      </div>

      {/* === NEW Section for Selected Category Badges === */}
      {selectedCategories.length > 0 && ( // Only show if categories are selected
        <div className="mt-4 pt-3 border-t"> {/* Add spacing and separator */}
            <Label className="text-xs text-muted-foreground mb-2 block">Filtros de categoría activos:</Label>
            <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <button
                            type="button"
                            onClick={() => handleRemoveCategory(category)} // Call remove handler
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                            aria-label={`Quitar filtro ${category}`}
                            disabled={isDisabled} // Disable remove button if filters are generally disabled
                        >
                            <X className="h-3 w-3"/>
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
      )}
      {/* === End Selected Category Badges Section === */}

    </div>
  );
}
