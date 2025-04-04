// src/components/explore/CompanyFilters.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanyFiltersType } from "@/actions/explore.action";
import { X, Loader2 } from "lucide-react";

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
  // Local state for uncommitted input
  const [searchInput, setSearchInput] = useState(appliedFilters.searchTerm || "");
  const [locationInput, setLocationInput] = useState(appliedFilters.location || "");
  const [selectedCategory, setSelectedCategory] = useState(appliedFilters.category || "");

  // Apply filters when Enter is pressed or input is blurred
  const applyTextFilters = () => {
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      category: selectedCategory || undefined,
      location: locationInput.trim() || undefined,
    });
  };

  // Handle category changes immediately
  const handleCategoryChange = (value: string) => {
    const newCategory = value === "all" ? "" : value;
    setSelectedCategory(newCategory);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      category: newCategory || undefined,
      location: locationInput.trim() || undefined,
    });
  };

  // Reset all filters
  const handleReset = () => {
    setSearchInput("");
    setLocationInput("");
    setSelectedCategory("");
    onFilterChange({});
  };

  const hasActiveFilters = !!(
    appliedFilters.searchTerm ||
    appliedFilters.category ||
    appliedFilters.location
  );

  return (
    <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="space-y-1">
          <Input
            id="search"
            placeholder="Buscar por nombre, usuario, bio..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyTextFilters()}
            onBlur={applyTextFilters}
            disabled={isDisabled}
          />
        </div>

        {/* Category Select */}
        <div className="space-y-1">
          <Select
            value={selectedCategory || "all"}
            onValueChange={handleCategoryChange}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Input */}
        <div className="space-y-1">
          <Input
            id="location"
            placeholder="Filtrar por ubicación..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyTextFilters()}
            onBlur={applyTextFilters}
            disabled={isDisabled}
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!hasActiveFilters || isDisabled}
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
