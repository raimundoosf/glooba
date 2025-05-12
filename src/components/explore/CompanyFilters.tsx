/**
 * Component for filtering companies by search term, categories, and location.
 * @module CompanyFilters
 */
'use client';

import { CompanyFiltersType } from '@/actions/explore.action';
import { MultiSelectCategories } from '@/components/MultiSelectCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Search, ArrowUpDown, ShoppingBag, Bike, X, MapPin } from 'lucide-react';
import React, { useCallback, useState } from 'react';

/**
 * Type for the view mode.
 */
export type ViewMode = 'posts' | 'list';

/**
 * Criteria for filtering.
 */
interface FilterCriteria {
  searchTerm?: string;
  location?: string;
  categories?: string[];
}

/**
 * Props interface for the CompanyFilters component
 * @interface CompanyFiltersProps
 */
interface CompanyFiltersProps {
  allCategories: string[];
  onFilterChange: (filters: FilterCriteria & { viewMode: ViewMode }) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  currentViewMode: ViewMode;
  isLoading?: boolean;
  initialSearchTerm?: string;
  initialLocation?: string;
  initialCategories?: string[];
}

/**
 * CompanyFilters component for searching, filtering, and sorting companies/posts.
 * Allows users to switch between a 'posts' view and a 'list' (companies) view.
 */
export function CompanyFilters({
  allCategories,
  onFilterChange,
  onViewModeChange,
  currentViewMode,
  isLoading = false,
  initialSearchTerm = '',
  initialLocation = '',
  initialCategories = [],
}: CompanyFiltersProps) {
  const [searchInput, setSearchInput] = useState<string>(initialSearchTerm);
  const [locationInput, setLocationInput] = useState<string>(initialLocation);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);

  const isDisabled = isLoading;

  const hasActiveFilters = React.useMemo(() => {
    return (
      searchInput.trim() !== '' ||
      locationInput.trim() !== '' ||
      selectedCategories.length > 0
    );
  }, [searchInput, locationInput, selectedCategories]);

  const applyFilters = useCallback(() => {
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      viewMode: currentViewMode,
    });
  }, [searchInput, locationInput, selectedCategories, onFilterChange, currentViewMode]);

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
    }
  };

  const handleLocationKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
      setIsLocationPopoverOpen(false);
    }
  };

  const handleCategoriesChange = (newSelection: string[]) => {
    setSelectedCategories(newSelection);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: newSelection.length > 0 ? newSelection : undefined,
      viewMode: currentViewMode,
    });
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    const newSelection = selectedCategories.filter((cat) => cat !== categoryToRemove);
    setSelectedCategories(newSelection);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: newSelection.length > 0 ? newSelection : undefined,
      viewMode: currentViewMode,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setLocationInput('');
    setSelectedCategories([]);
    onFilterChange({
      searchTerm: undefined,
      location: undefined,
      categories: undefined,
      viewMode: currentViewMode,
    });
  };

  const handleSort = () => console.log('Sort action triggered');

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Input
          id="search"
          placeholder="¿Qué quieres buscar?"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          disabled={isDisabled}
          className="pl-10 pr-4 py-2 rounded-full border focus:border-primary focus:ring-primary h-12 text-base"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <ToggleGroup
        type="single"
        value={currentViewMode}
        onValueChange={(value: string) => {
          if (value) {
            onViewModeChange(value as ViewMode);
          }
        }}
        className="w-full grid grid-cols-2 rounded-full p-1 bg-muted"
        disabled={isDisabled}
      >
        <ToggleGroupItem
          value="posts"
          aria-label="Toggle posts view"
          className="rounded-full data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=off]:text-muted-foreground py-2.5 text-base font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:shadow-sm transition-colors"
        >
          Publicaciones
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="Toggle list view"
          className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground py-2.5 text-base font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:shadow-sm transition-colors"
        >
          Lista
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Filter Buttons Row - Wrapper for centering */}
      <div className="flex justify-center">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 no-scrollbar ">
          {/* Sort Button */}
          <Button
            variant="outline"
            onClick={handleSort}
            disabled={isDisabled}
            className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Ordenar</span>
          </Button>

          <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Categorías</span>
                {selectedCategories.length > 0 && (
                  <Badge 
                    variant="secondary"
                    className="ml-1.5 h-5 px-1.5 text-xs font-medium rounded-full"
                  >
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-xs sm:max-w-sm p-4" align="start">
              <MultiSelectCategories
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                onChange={handleCategoriesChange}
                disabled={isDisabled}
                renderBareList={true}
              />
            </PopoverContent>
          </Popover>

          <Popover open={isLocationPopoverOpen} onOpenChange={setIsLocationPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span>Localización</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-[200px] p-2" align="start">
              <Label htmlFor="location-popover" className="sr-only">Ubicación</Label>
              <Input
                id="location-popover"
                placeholder="Ciudad, dirección..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                disabled={isDisabled}
                className="h-9"
              />
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              disabled={isDisabled}
              className="flex items-center space-x-1 rounded-full bg-background border hover:bg-accent h-10 w-10 text-sm ml-2 flex-shrink-0"
              aria-label="Resetear filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div> {/* End of inner flex container for buttons */}
      </div> {/* End of centering wrapper */}

      {/* === NEW Section for Selected Category Badges === */}
      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">
            Categorías seleccionadas:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                  aria-label={`Quitar filtro ${category}`}
                  disabled={isDisabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
