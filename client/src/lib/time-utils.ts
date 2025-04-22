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