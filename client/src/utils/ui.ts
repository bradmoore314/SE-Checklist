/**
 * UI Utility Functions
 * 
 * Consolidated utility functions for UI functionality throughout the application.
 * Combines common UI utilities from various files for consistent usage.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Combine class names with Tailwind's merge functionality
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create column definitions helper for data tables
 */
export function createColumnHelper<T>() {
  return {
    accessor: <K extends keyof T & string>(
      accessor: K,
      options: Partial<ColumnDef<T, T[K]>> = {}
    ): ColumnDef<T, T[K]> => ({
      accessorKey: accessor,
      ...options,
    }),

    display: <K extends keyof T & string>(
      id: string,
      options: Partial<ColumnDef<T, any>> = {}
    ): ColumnDef<T, any> => ({
      id,
      ...options,
    }),
  };
}

/**
 * Helper to load dropdown options from lookupData
 */
export function createOptions(items: { label: string; value: string }[]): { label: string; value: string }[] {
  return items.map(item => ({
    label: item.label || item.value,
    value: item.value
  }));
}

/**
 * Function to create a sortable column definition
 */
export function createSortableColumn<T>(
  accessor: keyof T & string,
  header: string,
  options: Partial<ColumnDef<T, any>> = {}
): ColumnDef<T, any> {
  return {
    accessorKey: accessor,
    header: header,
    ...options,
  };
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a file size in bytes to a human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a percentage value with specified decimals
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get a CSS compatible color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle rgb colors
  if (color.startsWith('rgb(')) {
    const rgb = color.slice(4, -1).split(',').map(c => parseInt(c.trim()));
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
  }
  
  // Handle named colors (less precise but still useful)
  return color;
}