/**
 * String utilities
 * Pure functions for string manipulation
 */

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str.split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove extra whitespace
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return str;
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string is empty or whitespace
 */
export function isEmptyOrWhitespace(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Generate a slug from string
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Format phone number (basic US format)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;

  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Check if string is a valid email (basic validation)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}