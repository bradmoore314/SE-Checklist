/**
 * Date and Time Utility Functions
 * 
 * Consolidated utility functions for handling dates and times throughout the application.
 * Combines functionality from both utils and lib folders for consistent usage.
 */

/**
 * Format a date to a human-readable string
 */
export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time to a human-readable string
 */
export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

/**
 * Convert time string in format "HH:MM" to total minutes
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes to time string in format "HH:MM"
 */
export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Set minutes in a time string to default value of "00"
 * Used to fix monitoring minutes default from "20" to "00"
 */
export function setDefaultMinutes(timeString: string, defaultMinutes: string = "00"): string {
  const [hours] = timeString.split(":");
  return `${hours}:${defaultMinutes}`;
}

/**
 * Format time string to include AM/PM for display
 */
export function formatTimeForDisplay(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  } catch (e) {
    return timeString; // Return original if parsing fails
  }
}

/**
 * Get a relative time description (e.g. 2 days ago, just now, etc.)
 */
export function getRelativeTimeDescription(date: Date | string | number): string {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInMs = now.getTime() - inputDate.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date);
  }
}