/**
 * Utility functions for the application.
 * @module utils
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function that combines clsx and twMerge for class name merging.
 * This function:
 * - Combines multiple class names using clsx
 * - Merges Tailwind classes using twMerge to prevent conflicts
 * - Returns a single string of merged classes
 * @param {ClassValue[]} inputs - Array of class names or conditions
 * @returns {string} Merged class names string
 * @example
 * // Returns "bg-blue-500 hover:bg-blue-600"
 * cn('bg-blue-500', 'hover:bg-blue-600')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
