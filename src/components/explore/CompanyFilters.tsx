/**
 * Component for filtering companies by search term, categories, and location.
 * @module CompanyFilters
 */
'use client';

import { CompanyFiltersType, SortOption } from '@/actions/explore.action';
import { MultiSelectCategories } from '@/components/MultiSelectCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, ArrowUpDown, ShoppingBag, Bike, X, MapPin, Check } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react';

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
  sortBy?: SortOption;
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
  initialSortBy?: SortOption;
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
  initialSortBy = 'name_asc',
}: CompanyFiltersProps) {
  const [searchInput, setSearchInput] = useState<string>(initialSearchTerm);
  const [locationInput, setLocationInput] = useState<string>(initialLocation);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories || []);
  // State for sort functionality and dialogs
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Local form states
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(
    initialCategories || []
  );
  const [localLocationInput, setLocalLocationInput] = useState(initialLocation);

  // Sync local state with props
  useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setLocalLocationInput(locationInput);
  }, [locationInput]);
  
  // Update sort when initialSortBy changes
  useEffect(() => {
    setSortBy(initialSortBy);
  }, [initialSortBy]);

  const handleApplyCategories = () => {
    setSelectedCategories(localSelectedCategories);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: localSelectedCategories.length > 0 ? localSelectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
    });
    setIsCategoryDialogOpen(false);
  };

  const handleApplyLocation = () => {
    setLocationInput(localLocationInput);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: localLocationInput.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
    });
    setIsLocationDialogOpen(false);
  };

  const handleClearCategories = () => {
    setLocalSelectedCategories([]);
  };

  const handleClearLocation = () => {
    setLocalLocationInput('');
  };

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
      sortBy,
      viewMode: currentViewMode,
    });
  }, [searchInput, locationInput, selectedCategories, sortBy, onFilterChange, currentViewMode]);

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
      setIsLocationDialogOpen(false);
    }
  };

  const handleCategoriesChange = (newSelection: string[]) => {
    setSelectedCategories(newSelection);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: newSelection.length > 0 ? newSelection : undefined,
      sortBy,
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
      sortBy,
      viewMode: currentViewMode,
    });
  };

  const handleSortSelect = (option: SortOption) => {
    setSortBy(option);
    setIsSortOpen(false);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy: option,
      viewMode: currentViewMode,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setLocationInput('');
    setSelectedCategories([]);
    setSortBy('name_asc');
    onFilterChange({
      searchTerm: undefined,
      location: undefined,
      categories: undefined,
      sortBy: 'name_asc',
      viewMode: currentViewMode,
    });
  };

  return (
    <div className="p-4 space-y-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="relative flex items-center">
        <Input
          id="search"
          placeholder="¿Qué quieres buscar?"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          disabled={isDisabled}
          className="lg:pl-10 pl-4 pr-12 py-2 rounded-full border focus:border-primary focus:ring-primary h-12 text-base"
        />
        <Search className="absolute left-3 h-5 w-5 text-muted-foreground hidden lg:block" />
        <button
          type="button"
          onClick={applyFilters}
          disabled={isDisabled}
          className="absolute right-2 p-1.5 rounded-full bg-input hover:bg-accent transition-colors lg:hidden"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5 text-primary" />
        </button>
      </div>

      <ToggleGroup
        type="single"
        value={currentViewMode}
        onValueChange={(value: string) => {
          if (value) {
            onViewModeChange(value as ViewMode);
          }
        }}
        className="w-full grid grid-cols-2 rounded-full bg-muted"
        disabled={isDisabled}
      >
        <ToggleGroupItem
          value="posts"
          aria-label="Toggle posts view"
          className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:text-muted-foreground py-2.5 text-base font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:shadow-sm transition-colors"
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
          {/* Sort Dialog */}
          <Dialog open={isSortOpen} onOpenChange={setIsSortOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Ordenar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Ordenar por</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="py-2 space-y-2">
                  <button
                    onClick={() => handleSortSelect('name_asc')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'name_asc' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'name_asc' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'name_asc' ? 'ml-6' : 'ml-8'}>Nombre (A-Z)</span>
                  </button>
                  <button
                    onClick={() => handleSortSelect('name_desc')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'name_desc' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'name_desc' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'name_desc' ? 'ml-6' : 'ml-8'}>Nombre (Z-A)</span>
                  </button>
                  <button
                    onClick={() => handleSortSelect('rating_desc')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'rating_desc' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'rating_desc' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'rating_desc' ? 'ml-6' : 'ml-8'}>Mejor valorados</span>
                  </button>
                  <button
                    onClick={() => handleSortSelect('reviews_desc')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'reviews_desc' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'reviews_desc' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'reviews_desc' ? 'ml-6' : 'ml-8'}>Más reseñas</span>
                  </button>
                  <button
                    onClick={() => handleSortSelect('followers_desc')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'followers_desc' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'followers_desc' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'followers_desc' ? 'ml-6' : 'ml-8'}>Más seguidores</span>
                  </button>
                  <button
                    onClick={() => handleSortSelect('newest')}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === 'newest' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                  >
                    {sortBy === 'newest' && <Check className="h-4 w-4 mr-2 text-primary" />}
                    <span className={sortBy === 'newest' ? 'ml-6' : 'ml-8'}>Más recientes</span>
                  </button>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Filtrar por categoría</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="py-2">
                  <MultiSelectCategories
                    allCategories={allCategories}
                    selectedCategories={localSelectedCategories}
                    onChange={setLocalSelectedCategories}
                    disabled={isDisabled}
                    renderBareList={true}
                    placeholder="Buscar categorías..."
                  />
                </div>
              </ScrollArea>
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleClearCategories}
                  disabled={localSelectedCategories.length === 0}
                >
                  Limpiar
                </Button>
                <Button onClick={handleApplyCategories}>
                  Aplicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span>Localización</span>
                {locationInput && (
                  <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrar por ubicación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <span>📍</span>
                    <span>Región o comuna</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ej: Santiago, Chile"
                    value={localLocationInput}
                    onChange={(e) => setLocalLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyLocation();
                      }
                    }}
                    disabled={isDisabled}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleClearLocation}
                  disabled={!localLocationInput}
                >
                  Limpiar
                </Button>
                <Button 
                  onClick={handleApplyLocation}
                  disabled={!localLocationInput.trim()}
                >
                  Aplicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
