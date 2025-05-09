// src/components/ui/MultiSelectCategories.tsx
'use client';

import { Check, ChevronsUpDown } from 'lucide-react'; // X is no longer used here
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
// Badge is no longer rendered directly in this component
import { ScrollArea } from '@/components/ui/scroll-area';

interface MultiSelectCategoriesProps {
  allCategories: string[];
  selectedCategories: string[]; // Still needed to show checkmarks
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxSelection?: number;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectCategories({
  allCategories,
  selectedCategories,
  onChange,
  placeholder = 'Select categories...',
  maxSelection,
  disabled = false,
  className, // className is now applied to the Popover root
}: MultiSelectCategoriesProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Use a Set for efficient checking of selected items
  const selectedSet = React.useMemo(() => new Set(selectedCategories), [selectedCategories]);

  const handleSelect = (category: string) => {
    let newSelected: string[];
    if (selectedSet.has(category)) {
      newSelected = selectedCategories.filter((item) => item !== category);
    } else {
      if (maxSelection && selectedCategories.length >= maxSelection) {
        return; // Prevent adding more if limit is enforced
      }
      newSelected = [...selectedCategories, category];
    }
    onChange(newSelected.sort());
  };

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return allCategories;
    return allCategories.filter((category) =>
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  const isMaxSelected = maxSelection && selectedCategories.length >= maxSelection;

  return (
    // Apply className to the Popover root if needed for positioning/sizing
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // Apply sizing/layout classes here if needed, or rely on parent div
          className={cn('w-full justify-between font-normal', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} seleccionada(s)` // Keep count indicator
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar categoría..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            disabled={disabled}
            className="hidden lg:block"
          />
          <CommandList>
            <ScrollArea className="h-[200px]">
              <CommandEmpty>No se encontró categoría.</CommandEmpty>
              <CommandGroup>
                {filteredCategories.map((category) => {
                  const isSelected = selectedSet.has(category);
                  const isDisabledItem = !isSelected && isMaxSelected;

                  return (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => {
                        if (!isDisabledItem) handleSelect(category);
                      }}
                      disabled={isDisabledItem || disabled}
                      className={cn(
                        'flex items-center justify-between',
                        isDisabledItem && 'opacity-50 cursor-not-allowed'
                      )}
                      aria-selected={isSelected}
                    >
                      {/* Checkbox visual indicator */}
                      <span>{category}</span>
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
