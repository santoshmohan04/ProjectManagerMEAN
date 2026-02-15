/**
 * Date formatting utilities
 * Pure functions for date manipulation and formatting
 */

/**
 * Format a date to a standard string format
 */
export function formatDate(date: Date | string | null | undefined, format: string = 'dd/MM/yyyy'): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Parse a date string to Date object
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get the difference in days between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Check if date1 is before date2
 */
export function isDateBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime();
}

/**
 * Check if date1 is after date2
 */
export function isDateAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}