import { useEffect } from "react";
import { setDefaultMinutes } from "@/lib/time-utils";

/**
 * Hook to ensure all time inputs default to having "00" minutes
 * Fixes the issue where time inputs default to "HH:20" instead of "HH:00"
 * 
 * @param defaultValue The value to set if no time is provided
 * @param updateFn The function to call to update the time value
 * @param dependencies Dependencies that would trigger the effect
 */
export function useDefaultTimeMinutes(
  value: string | undefined,
  updateFn: (value: string) => void,
  dependencies: any[] = []
): void {
  useEffect(() => {
    // If no value provided, set to default value with "00" minutes
    if (!value) {
      updateFn("08:00"); // Default to 8:00 AM if no value
      return;
    }
    
    // If value has minutes that aren't "00", update to "00"
    try {
      const minutesPart = value.split(":")[1];
      if (minutesPart !== "00") {
        const updatedValue = setDefaultMinutes(value, "00");
        updateFn(updatedValue);
      }
    } catch (error) {
      // If time format is invalid, set to default 
      updateFn("08:00");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, updateFn, ...dependencies]);
}

/**
 * Hook that initializes and standardizes time input values
 * Ensures values are properly formatted with "00" minutes
 * 
 * @param initialValue The initial time value
 * @param updateFn The function to call to update the time value
 * @param dependencies Dependencies that would trigger the effect
 * @returns The standardized time value
 */
export function useTimeInput(
  initialValue: string | undefined,
  updateFn: (value: string) => void,
  dependencies: any[] = []
): string {
  // Use the hook to ensure proper default values
  useDefaultTimeMinutes(initialValue, updateFn, dependencies);
  
  // Return standardized value
  return initialValue || "08:00";
}