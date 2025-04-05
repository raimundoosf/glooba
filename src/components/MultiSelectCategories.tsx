// src/components/ui/MultiSelectCategories.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";

import { cn } from "@/lib/utils"; // Assuming you have this utility
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

interface MultiSelectCategoriesProps {
  allCategories: string[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxSelection?: number;
  disabled?: boolean;
  className?: string; // Allow passing additional classes
}

export function MultiSelectCategories({
  allCategories,
  selectedCategories,
  onChange,
  placeholder = "Seleccionar categorías...",
  maxSelection,
  disabled = false,
  className,
}: MultiSelectCategoriesProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSelect = (category: string) => {
    let newSelected: string[];
    if (selectedCategories.includes(category)) {
      // Deselect
      newSelected = selectedCategories.filter((item) => item !== category);
    } else {
      // Select - check limit first
      if (maxSelection && selectedCategories.length >= maxSelection) {
        // Optionally show a toast or message here
        console.warn(`Se alcanzó el límite máximo de selección (${maxSelection}).`);
        return; // Prevent adding more
      }
      newSelected = [...selectedCategories, category];
    }
    onChange(newSelected.sort()); // Keep the list sorted
  };

  const handleRemove = (category: string) => {
    onChange(selectedCategories.filter((item) => item !== category).sort());
  };

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) {
      return allCategories;
    }
    return allCategories.filter((category) =>
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  const isMaxSelected = maxSelection && selectedCategories.length >= maxSelection;

  return (
    <div className={cn("space-y-2", className)}>
       {/* Display selected categories as badges */}
       <div className="flex flex-wrap gap-1 min-h-[24px]">
           {selectedCategories.length === 0 && !disabled && (
               <p className="text-xs text-muted-foreground px-3 py-1.5">{placeholder}</p>
           )}
           {selectedCategories.map((category) => (
               <Badge key={category} variant="secondary" className="flex items-center gap-1">
                   {category}
                   {!disabled && (
                       <button
                           type="button"
                           onClick={() => handleRemove(category)}
                           className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                           aria-label={`Eliminar ${category}`}
                       >
                           <X className="h-3 w-3"/>
                       </button>
                   )}
               </Badge>
           ))}
       </div>

       {/* Popover for selection */}
       <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
           <Button
             variant="outline"
             role="combobox"
             aria-expanded={open}
             className="w-full justify-between"
             disabled={disabled}
           >
             <span className="truncate">
               {selectedCategories.length > 0
                 ? `${selectedCategories.length} seleccionados`
                 : placeholder}
             </span>
             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[--radix-popover-trigger-width] p-0"> {/* Match trigger width */}
           <Command>
             <CommandInput
                placeholder="Buscar categoría..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                disabled={disabled}
             />
             <CommandList>
                <CommandEmpty>No se encontró categoría.</CommandEmpty>
                <ScrollArea className="h-[200px]"> {/* Make list scrollable */}
                    <CommandGroup>
                    {filteredCategories.map((category) => {
                        const isSelected = selectedCategories.includes(category);
                        const isDisabledItem = !isSelected && isMaxSelected; // Disable adding if max reached

                        return (
                        <CommandItem
                            key={category}
                            value={category} // Ensure value is set for Command filtering
                            onSelect={() => {
                                if (!isDisabledItem) {
                                    handleSelect(category);
                                }
                            }}
                            disabled={isDisabledItem || disabled}
                            className={cn("flex items-center justify-between", isDisabledItem && "opacity-50 cursor-not-allowed")}
                            aria-selected={isSelected}
                        >
                            <span>{category}</span>
                            <Check
                            className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                            )}
                            />
                        </CommandItem>
                        );
                    })}
                    </CommandGroup>
                </ScrollArea>
             </CommandList>
           </Command>
         </PopoverContent>
       </Popover>
       {isMaxSelected && (
           <p className="text-xs text-destructive mt-1">
               Se alcanzó el límite máximo de selección ({maxSelection}).
           </p>
       )}
    </div>
  );
}

