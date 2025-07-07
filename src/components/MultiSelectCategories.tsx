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
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCategoryIcon, getCategoryColor } from '@/lib/constants';

/**
 * Generates a consistent color for a given string
 * @param str - The string to generate a color for
 * @returns A Tailwind CSS color class
 */
// This function is no longer needed as we now use getCategoryColor

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
  const [inputValue, setInputValue] = React.useState('');
  const selectedSet = React.useMemo(() => new Set(selectedCategories), [selectedCategories]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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
                    {(() => {
                      const Icon = getCategoryIcon(category);
                      const iconColor = getCategoryColor(category);
                      return <Icon className={`h-5 w-5 ${iconColor}`} />;
                    })()}
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

  // Event handlers
  const handleToggle = React.useCallback(() => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggle();
  };

  // Original rendering with Popover
  return (
    <div className="relative w-full">
      <div 
        className={cn(
          'flex items-center w-full',
          className
        )}
      >
        <Button
          type="button"
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            open && 'border-primary ring-2 ring-primary/20'
          )}
          disabled={disabled}
          onClick={handleButtonClick}
        >
          <span className="truncate">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} seleccionada(s)`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
      
      {open && !renderBareList && (
        <div
          className={cn(
            'absolute z-50 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none'
          )}
        >
          {commandComponent}
        </div>
      )}
      
      {renderBareList && commandComponent}
    </div>
  );
}
