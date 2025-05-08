/**
 * UI Utility Functions
 * 
 * This file contains reusable utility functions for UI-related tasks.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * This function is used to combine conditional class names with tailwind classes
 * 
 * @param inputs - Class name inputs to combine
 * @returns Combined and merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number value to a specific currency
 * 
 * @param value - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formats a number as a percentage
 * 
 * @param value - Number to format (0-1)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Creates a debounced version of a function
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Truncates a string to a maximum length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generates an array of numbers for pagination
 * 
 * @param currentPage - Current page number
 * @param totalPages - Total pages available
 * @param maxPageButtons - Maximum number of page buttons to show
 * @returns Array of page numbers to display
 */
export function getPaginationRange(currentPage: number, totalPages: number, maxPageButtons: number = 5): number[] {
  // If we have fewer pages than the max, just return all pages
  if (totalPages <= maxPageButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Calculate the start and end of the pagination range
  let start = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
  let end = start + maxPageButtons - 1;
  
  // Adjust if end is beyond total pages
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(end - maxPageButtons + 1, 1);
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Downloads content as a file
 * 
 * @param content - Content to download
 * @param fileName - Name of the file
 * @param contentType - Content type of the file
 */
export function downloadFile(content: string, fileName: string, contentType: string): void {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(a.href);
}