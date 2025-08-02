/**
 * Component for filtering companies by search term, categories, and location.
 * @module CompanyFilters
 */
"use client";

import { CompanyFiltersType, SortOption } from "@/actions/explore.action";
import { ScopeType, Region, Commune } from "@prisma/client";
import { MultiSelectCategories } from "@/components/MultiSelectCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  ArrowUpDown,
  ShoppingBag,
  X,
  Map,
  Check,
  MapPin,
} from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";

/**
 * Type for the view mode.
 */
export type ViewMode = "posts" | "list";

/**
 * Criteria for filtering.
 */
interface FilterCriteria {
  searchTerm?: string;
  location?: string;
  categories?: string[];
  sortBy?: SortOption;
  scope?: ScopeType;
  regions?: string[];
  communes?: string[];
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
  initialSearchTerm = "",
  initialLocation = "",
  initialCategories = [],
  initialSortBy = "newest",
}: CompanyFiltersProps) {
  const [searchInput, setSearchInput] = useState<string>(initialSearchTerm);
  const [locationInput, setLocationInput] = useState<string>(initialLocation);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories || []
  );
  // State for sort functionality and dialogs
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Geographical scope states
  const [scope, setScope] = useState<ScopeType | undefined>(undefined);
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [communesForSelectedRegions, setCommunesForSelectedRegions] = useState<
    Commune[]
  >([]);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);

  // Local scope dialog states
  const [localScope, setLocalScope] = useState<ScopeType | undefined>(
    undefined
  );
  const [localSelectedRegions, setLocalSelectedRegions] = useState<string[]>(
    []
  );
  const [localSelectedCommunes, setLocalSelectedCommunes] = useState<string[]>(
    []
  );

  // Local form states
  const [localSelectedCategories, setLocalSelectedCategories] = useState<
    string[]
  >(initialCategories || []);
  const [localLocationInput, setLocalLocationInput] = useState(initialLocation);

  // Load regions when component mounts
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch("/api/regions");
        if (!res.ok) throw new Error("Error loading regions");
        const data = await res.json();
        setAllRegions(data);
      } catch (error) {
        console.error("Error loading regions:", error);
        toast.error("No se pudieron cargar las regiones");
      }
    };
    fetchRegions();
  }, []);

  // Load communes when regions are selected in the COMMUNE mode
  useEffect(() => {
    if (localScope !== "COMMUNE" || localSelectedRegions.length === 0) {
      setCommunesForSelectedRegions([]);
      return;
    }

    const fetchCommunes = async () => {
      try {
        const promises = localSelectedRegions.map((regionId) =>
          fetch(`/api/regions/${regionId}/communes`).then((res) => res.json())
        );
        const results = await Promise.all(promises);
        setCommunesForSelectedRegions(results.flat());
      } catch (error) {
        toast.error("No se pudieron cargar las comunas");
      }
    };

    fetchCommunes();
  }, [localSelectedRegions, localScope]);

  // Sync local state with props
  useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setLocalLocationInput(locationInput);
  }, [locationInput]);

  // Initialize geographical scope
  useEffect(() => {
    setLocalScope(undefined);
    setLocalSelectedRegions([]);
    setLocalSelectedCommunes([]);
    setScope(undefined);
    setSelectedRegions([]);
    setSelectedCommunes([]);
  }, []);

  // Update sort when initialSortBy changes
  useEffect(() => {
    setSortBy(initialSortBy);
  }, [initialSortBy]);

  const handleApplyCategories = () => {
    setSelectedCategories(localSelectedCategories);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories:
        localSelectedCategories.length > 0
          ? localSelectedCategories
          : undefined,
      sortBy,
      viewMode: currentViewMode,
      scope,
      regions: scope === "REGION" ? selectedRegions : undefined,
      communes: scope === "COMMUNE" ? selectedCommunes : undefined,
    });
    setIsCategoryDialogOpen(false);
  };

  // Handle scope filter application
  const handleApplyScope = () => {
    // If no scope is defined, clear all scope filters
    if (!localScope) {
      setScope(undefined);
      setSelectedRegions([]);
      setSelectedCommunes([]);
      setLocalSelectedRegions([]);
      setLocalSelectedCommunes([]);
    } else {
      // Update the scope state with the selected scope
      setScope(localScope);

      // If "Todo Chile" is selected, clear selected regions and communes
      if (localScope === "COUNTRY") {
        setSelectedRegions([]);
        setSelectedCommunes([]);
        setLocalSelectedRegions([]);
        setLocalSelectedCommunes([]);
      } else {
        setSelectedRegions([...localSelectedRegions]);
        setSelectedCommunes([...localSelectedCommunes]);
      }
    }

    // Apply filters
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
      ...(localScope && { scope: localScope }),
      ...(localScope === "REGION" &&
        localSelectedRegions.length > 0 && {
          regions: localSelectedRegions,
        }),
      ...(localScope === "COMMUNE" &&
        localSelectedCommunes.length > 0 && {
          communes: localSelectedCommunes,
        }),
    });

    setIsScopeDialogOpen(false);
  };

  // Handle region selection change
  const handleRegionToggle = (regionId: string, checked: boolean) => {
    if (checked) {
      setLocalSelectedRegions((prev) => [...prev, regionId]);
    } else {
      // If a region is deselected, also deselect its communes
      const communesToRemove = communesForSelectedRegions
        .filter((c) => c.regionId === regionId)
        .map((c) => c.id);

      setLocalSelectedRegions((prev) => prev.filter((id) => id !== regionId));
      setLocalSelectedCommunes((prev) =>
        prev.filter((id) => !communesToRemove.includes(id))
      );
    }
  };

  // Handle commune selection change
  const handleCommuneToggle = (communeId: string, checked: boolean) => {
    if (checked) {
      setLocalSelectedCommunes((prev) => [...prev, communeId]);
    } else {
      setLocalSelectedCommunes((prev) => prev.filter((id) => id !== communeId));
    }
  };

  // Clear scope filters
  const handleClearScope = () => {
    // Clear local states
    setLocalScope(undefined);
    setLocalSelectedRegions([]);
    setLocalSelectedCommunes([]);

    // Clear filter states
    setScope(undefined);
    setSelectedRegions([]);
    setSelectedCommunes([]);

    // Apply changes immediately without scope filter
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
      scope: undefined,
      regions: undefined,
      communes: undefined,
    });
  };

  const handleApplyLocation = () => {
    setLocationInput(localLocationInput);
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: localLocationInput.trim() || undefined,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
    });
    setIsLocationDialogOpen(false);
  };

  const handleClearCategories = () => {
    setLocalSelectedCategories([]);
  };

  const handleClearLocation = () => {
    setLocalLocationInput("");
  };

  const isDisabled = isLoading;

  const hasActiveFilters = React.useMemo(() => {
    return (
      searchInput.trim() !== "" ||
      locationInput.trim() !== "" ||
      selectedCategories.length > 0 ||
      scope !== undefined ||
      selectedRegions.length > 0 ||
      selectedCommunes.length > 0
    );
  }, [
    searchInput,
    locationInput,
    selectedCategories,
    scope,
    selectedRegions,
    selectedCommunes,
  ]);

  const applyFilters = useCallback(() => {
    onFilterChange({
      searchTerm: searchInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      viewMode: currentViewMode,
      scope,
      regions: scope === "REGION" ? selectedRegions : undefined,
      communes: scope === "COMMUNE" ? selectedCommunes : undefined,
    });
  }, [
    searchInput,
    locationInput,
    selectedCategories,
    sortBy,
    onFilterChange,
    currentViewMode,
    scope,
    selectedRegions,
    selectedCommunes,
  ]);

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFilters();
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    const newSelection = selectedCategories.filter(
      (cat) => cat !== categoryToRemove
    );
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
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy: option,
      viewMode: currentViewMode,
    });
  };

  const handleReset = () => {
    setSearchInput("");
    setLocationInput("");
    setSelectedCategories([]);
    setSortBy("name_asc");

    // Reset geographical scope
    setScope(undefined);
    setSelectedRegions([]);
    setSelectedCommunes([]);

    // Reset local geographical scope
    setLocalSelectedRegions([]);
    setLocalSelectedCommunes([]);

    onFilterChange({
      searchTerm: "",
      location: "",
      categories: [],
      sortBy: "name_asc",
      viewMode: currentViewMode,
    });
  };

  return (
    <div className="p-4 space-y-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Input
            id="search"
            placeholder="¿Qué alternativa buscas?"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={isDisabled}
            className="lg:pl-10 pl-4 pr-12 py-2 rounded-full border focus:border-primary focus:ring-primary h-12 text-base"
          />
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${searchInput ? "text-primary" : "text-muted-foreground"} hidden lg:block transition-colors`}
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                // Optionally trigger search with empty input
                if (searchInput.trim()) {
                  handleSearchKeyDown({
                    key: "Enter",
                  } as React.KeyboardEvent<HTMLInputElement>);
                }
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-5 w-5 text-muted-foreground lg:hidden" />
            </button>
          )}

          <button
            type="button"
            onClick={applyFilters}
            disabled={isDisabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-input hover:bg-accent transition-colors lg:hidden"
            aria-label="Buscar"
          >
            <Search
              className={`h-5 w-5 ${searchInput ? "text-primary" : "text-muted-foreground"} transition-colors`}
            />
          </button>
        </div>
      </div>

      <ToggleGroup
        type="single"
        value={currentViewMode}
        onValueChange={(value: string) => {
          if (value) {
            onViewModeChange(value as ViewMode);
          }
        }}
        className="w-full grid grid-cols-2 rounded-full bg-secondary"
        disabled={isDisabled}
      >
        <ToggleGroupItem
          value="posts"
          aria-label="Toggle posts view"
          className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-secondary data-[state=off]:text-primary py-2.5 text-base font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:shadow-sm transition-colors dark:data-[state=on]:bg-primary dark:data-[state=on]:text-primary-foreground dark:data-[state=off]:bg-secondary dark:data-[state=off]:text-muted-foreground"
        >
          Publicaciones
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="Toggle list view"
          className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-secondary data-[state=off]:text-primary py-2.5 text-base font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:shadow-sm transition-colors dark:data-[state=on]:bg-primary dark:data-[state=on]:text-primary-foreground dark:data-[state=off]:bg-secondary dark:data-[state=off]:text-muted-foreground"
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
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col rounded-2xl border-0 shadow-xl">
              <DialogHeader className="px  -2">
                <DialogTitle className="text-lg font-semibold">
                  Ordenar por
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => handleSortSelect("newest")}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === "newest" ? "bg-accent" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "newest" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span className={sortBy === "newest" ? "ml-6" : "ml-8"}>
                      Más recientes
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortSelect("rating_desc")}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors duration-200 ${sortBy === "rating_desc" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "rating_desc" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span
                      className={sortBy === "rating_desc" ? "ml-6" : "ml-8"}
                    >
                      Mejor valorados
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortSelect("reviews_desc")}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors duration-200 ${sortBy === "reviews_desc" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "reviews_desc" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span
                      className={sortBy === "reviews_desc" ? "ml-6" : "ml-8"}
                    >
                      Más reseñas
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortSelect("followers_desc")}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm flex items-center ${sortBy === "followers_desc" ? "bg-accent" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "followers_desc" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span
                      className={sortBy === "followers_desc" ? "ml-6" : "ml-8"}
                    >
                      Más seguidores
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortSelect("name_asc")}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors duration-200 ${sortBy === "name_asc" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "name_asc" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span className={sortBy === "name_asc" ? "ml-6" : "ml-8"}>
                      Nombre (A-Z)
                    </span>
                  </button>
                  <button
                    onClick={() => handleSortSelect("name_desc")}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors duration-200 ${sortBy === "name_desc" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                  >
                    {sortBy === "name_desc" && (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    )}
                    <span className={sortBy === "name_desc" ? "ml-6" : "ml-8"}>
                      Nombre (Z-A)
                    </span>
                  </button>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
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
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col rounded-2xl border-0 shadow-xl">
              <DialogHeader className="px-2">
                <DialogTitle className="text-lg font-semibold">
                  Filtrar por categoría
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="py-1">
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
              <div className="flex justify-between pt-4 border-t gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearCategories}
                  disabled={localSelectedCategories.length === 0}
                  className="flex-1 rounded-lg border-border/50 hover:bg-accent/50 transition-colors"
                >
                  Limpiar
                </Button>
                <Button
                  variant="default"
                  className="flex-1 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                  onClick={handleApplyCategories}
                >
                  Aplicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isLocationDialogOpen}
            onOpenChange={setIsLocationDialogOpen}
          >
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
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Filtrar por ubicación
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-1">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <span>📍</span>
                    <span>Región o comuna</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ej: Santiago, Chile"
                      value={localLocationInput}
                      onChange={(e) => setLocalLocationInput(e.target.value)}
                    />
                    {/* <MapPin className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${localLocationInput ? 'text-primary' : 'text-muted-foreground'} transition-colors`} /> */}

                    <button
                      type="button"
                      onClick={handleApplyLocation}
                      disabled={!localLocationInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-accent transition-colors"
                      aria-label="Buscar ubicación"
                    >
                      <Search
                        className={`h-4 w-4 ${localLocationInput ? "text-primary" : "text-muted-foreground"} transition-colors`}
                      />
                    </button>

                    {localLocationInput && (
                      <button
                        type="button"
                        onClick={() => setLocalLocationInput("")}
                        className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
                        aria-label="Limpiar ubicación"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearLocation}
                  disabled={!localLocationInput}
                  className="flex-1 rounded-lg border-border/50 hover:bg-accent/50 transition-colors"
                >
                  Limpiar
                </Button>
                <Button
                  variant="default"
                  className="flex-1 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                  onClick={handleApplyLocation}
                  disabled={!localLocationInput.trim()}
                >
                  Aplicar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Geographical Scope Filter */}
          <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className="flex items-center space-x-2 rounded-full bg-background border hover:bg-accent h-10 px-4 py-2 text-sm whitespace-nowrap"
              >
                <Map className="h-4 w-4" />
                <span>
                  {!scope
                    ? "Área de cobertura"
                    : scope === "COUNTRY"
                      ? "Todo Chile"
                      : scope === "REGION"
                        ? `${selectedRegions.length} región(es)`
                        : `${selectedCommunes.length} comuna(s)`}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col rounded-2xl border-0 shadow-xl">
              <DialogHeader className="px-2">
                <DialogTitle className="text-lg font-semibold">
                  Filtrar por área de cobertura
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="py-1 space-y-6">
                  <div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setLocalScope("COUNTRY")}
                        className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center text-sm transition-colors ${localScope === "COUNTRY" ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                      >
                        <span>Todo Chile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalScope("REGION")}
                        className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center text-sm transition-colors ${localScope === "REGION" ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                      >
                        <span>Por Región</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalScope("COMMUNE")}
                        className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center text-sm transition-colors ${localScope === "COMMUNE" ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                      >
                        <span>Por Comuna</span>
                      </button>
                    </div>
                  </div>

                  {localScope === "REGION" && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium">
                        Seleccionar Regiones
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {allRegions.map((region) => (
                          <div
                            key={region.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`region-${region.id}`}
                              checked={localSelectedRegions.includes(region.id)}
                              onChange={(e) =>
                                handleRegionToggle(region.id, e.target.checked)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor={`region-${region.id}`}
                              className="text-sm leading-none"
                            >
                              {region.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {localScope === "COMMUNE" && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium">
                        Seleccionar Regiones y Comunas
                      </h3>
                      <div className="space-y-4">
                        {allRegions.map((region) => (
                          <div key={region.id} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`region-commune-${region.id}`}
                                checked={localSelectedRegions.includes(
                                  region.id
                                )}
                                onChange={(e) =>
                                  handleRegionToggle(
                                    region.id,
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor={`region-commune-${region.id}`}
                                className="font-medium text-sm"
                              >
                                {region.name}
                              </label>
                            </div>
                            {localSelectedRegions.includes(region.id) && (
                              <div className="ml-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {communesForSelectedRegions
                                  .filter((c) => c.regionId === region.id)
                                  .map((commune) => (
                                    <div
                                      key={commune.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`commune-${commune.id}`}
                                        checked={localSelectedCommunes.includes(
                                          commune.id
                                        )}
                                        onChange={(e) =>
                                          handleCommuneToggle(
                                            commune.id,
                                            e.target.checked
                                          )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <label
                                        htmlFor={`commune-${commune.id}`}
                                        className="text-sm leading-none"
                                      >
                                        {commune.name}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex justify-between px-6 py-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleClearScope();
                    setIsScopeDialogOpen(false);
                  }}
                >
                  Limpiar
                </Button>
                <Button type="button" onClick={handleApplyScope}>
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
        </div>
      </div>

      {/* === Section for Selected Category Badges === */}
      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">
            Categorías seleccionadas:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1 pl-2 pr-1 py-0.5"
              >
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
