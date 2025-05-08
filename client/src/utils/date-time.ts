/**
 * Date and Time Utility Functions
 * 
 * This file contains utility functions for handling date and time operations.
 */

/**
 * Format a date using the browser's Intl.DateTimeFormat
 * 
 * @param date - The date to format
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
  }).format(dateObj);
}

/**
 * Format a time using the browser's Intl.DateTimeFormat
 * 
 * @param time - The time to format
 * @param includeSeconds - Whether to include seconds
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted time string
 */
export function formatTime(
  time: Date | string | number,
  includeSeconds: boolean = false,
  locale: string = 'en-US'
): string {
  const dateObj = time instanceof Date ? time : new Date(time);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: includeSeconds ? 'numeric' : undefined,
    hour12: true,
  }).format(dateObj);
}

/**
 * Format a date and time together
 * 
 * @param datetime - The date and time to format
 * @param dateFormat - Format style for the date
 * @param includeSeconds - Whether to include seconds in the time
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(
  datetime: Date | string | number,
  dateFormat: 'short' | 'medium' | 'long' | 'full' = 'medium',
  includeSeconds: boolean = false,
  locale: string = 'en-US'
): string {
  const dateObj = datetime instanceof Date ? datetime : new Date(datetime);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: dateFormat,
    timeStyle: includeSeconds ? 'medium' : 'short',
  }).format(dateObj);
}

/**
 * Get the relative time (e.g., "2 hours ago", "in 3 days")
 * 
 * @param date - The date to compare against now
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Relative time string
 */
export function getRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  });
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (Math.abs(days) >= 7) {
    const weeks = Math.floor(days / 7);
    return formatter.format(weeks, 'week');
  } else if (Math.abs(days) > 0) {
    return formatter.format(days, 'day');
  } else if (Math.abs(hours) > 0) {
    return formatter.format(hours, 'hour');
  } else if (Math.abs(minutes) > 0) {
    return formatter.format(minutes, 'minute');
  } else {
    return formatter.format(seconds, 'second');
  }
}

/**
 * Add time to a date
 * 
 * @param date - The starting date
 * @param amount - The amount to add
 * @param unit - The unit of time to add
 * @returns The new date
 */
export function addTime(
  date: Date,
  amount: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
): Date {
  const result = new Date(date);
  switch (unit) {
    case 'second':
      result.setSeconds(result.getSeconds() + amount);
      break;
    case 'minute':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'hour':
      result.setHours(result.getHours() + amount);
      break;
    case 'day':
      result.setDate(result.getDate() + amount);
      break;
    case 'week':
      result.setDate(result.getDate() + amount * 7);
      break;
    case 'month':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  return result;
}

/**
 * Check if a date is today
 * 
 * @param date - The date to check
 * @returns Whether the date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * 
 * @param date - The date to check
 * @returns Whether the date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.getTime() < Date.now();
}

/**
 * Get the difference between two dates in the specified unit
 * 
 * @param dateA - The first date
 * @param dateB - The second date
 * @param unit - The unit to return the difference in
 * @returns The difference between the dates in the specified unit
 */
export function getDateDifference(
  dateA: Date | string | number,
  dateB: Date | string | number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'
): number {
  const dateObjA = dateA instanceof Date ? dateA : new Date(dateA);
  const dateObjB = dateB instanceof Date ? dateB : new Date(dateB);
  
  const diffInMs = Math.abs(dateObjA.getTime() - dateObjB.getTime());
  
  switch (unit) {
    case 'milliseconds':
      return diffInMs;
    case 'seconds':
      return diffInMs / 1000;
    case 'minutes':
      return diffInMs / (1000 * 60);
    case 'hours':
      return diffInMs / (1000 * 60 * 60);
    case 'days':
      return diffInMs / (1000 * 60 * 60 * 24);
    default:
      return diffInMs;
  }
}