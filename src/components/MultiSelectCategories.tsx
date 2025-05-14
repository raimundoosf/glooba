/**
 * Multi-select dropdown component for selecting categories.
 * @module MultiSelectCategories
 */
'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCategoryEmoji } from '@/lib/constants';

/**
 * Props interface for the MultiSelectCategories component
 * @interface MultiSelectCategoriesProps
 */
interface MultiSelectCategoriesProps {
  allCategories: string[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxSelection?: number;
  disabled?: boolean;
  className?: string;
  renderBareList?: boolean;
}

/**
 * Multi-select dropdown component that allows users to:
 * - Select multiple categories from a list
 * - Search through categories
 * - See how many categories are selected
 * - Set a maximum number of selections
 * - Handle disabled state
 * @param {MultiSelectCategoriesProps} props - Component props
 * @returns {JSX.Element} The multi-select categories component
 */
export function MultiSelectCategories({
  allCategories,
  selectedCategories,
  onChange,
  placeholder = 'Select categories...',
  maxSelection,
  disabled = false,
  className,
  renderBareList = false,
}: MultiSelectCategoriesProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = React.useMemo(() => new Set(selectedCategories), [selectedCategories]);

  /**
   * Handles category selection/deselection and maintains sorted order.
   * @param {string} category - The category to select/deselect
   */
  const handleSelect = (category: string) => {
    let newSelected: string[];
    if (selectedSet.has(category)) {
      newSelected = selectedCategories.filter((item) => item !== category);
    } else {
      if (maxSelection && selectedCategories.length >= maxSelection) {
        return;
      }
      newSelected = [...selectedCategories, category];
    }
    onChange(newSelected.sort());
  };

  const isMaxSelected = maxSelection && selectedCategories.length >= maxSelection;

  // Define the Command component structure
  const commandComponent = (
    <Command>
      <CommandList>
        <ScrollArea className="h-[200px]">
          <CommandGroup>
            {allCategories.map((category) => {
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
                    isDisabledItem && 'opacity-50 cursor-not-allowed',
                    'px-4 py-2 text-sm'
                  )}
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryEmoji(category)}</span>
                    <span>{category}</span>
                  </span>
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
  );

  // Conditionally render based on renderBareList
  if (renderBareList) {
    return commandComponent; // Render only the command list
  }

  // Original rendering with Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} seleccionada(s)`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {commandComponent} 
      </PopoverContent>
    </Popover>
  );
}
