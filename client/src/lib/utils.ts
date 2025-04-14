import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ColumnDef } from "@tanstack/react-table"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

// Create column definitions helper
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

// Helper to load dropdown options from lookupData
export function createOptions(items: { label: string; value: string }[]): { label: string; value: string }[] {
  return items.map(item => ({
    label: item.label || item.value,
    value: item.value
  }));
}

// Function to create a sortable column definition
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