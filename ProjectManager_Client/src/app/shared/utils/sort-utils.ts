/**
 * Sorting utilities
 * Pure functions for sorting arrays of objects
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * Generic sort function for arrays of objects
 */
export function sortByKey<T>(
  array: T[],
  key: keyof T,
  direction: SortDirection = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? -1 : 1;
    if (bValue == null) return direction === 'asc' ? 1 : -1;

    // Handle different types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Convert to strings for comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Sort by multiple keys (stable sort)
 */
export function sortByMultipleKeys<T>(
  array: T[],
  sortConfigs: SortConfig<T>[]
): T[] {
  return [...array].sort((a, b) => {
    for (const config of sortConfigs) {
      const comparison = compareValues(a[config.key], b[config.key]);
      if (comparison !== 0) {
        return config.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Helper function to compare two values
 */
function compareValues(a: any, b: any): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  // Handle strings
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Handle booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }

  // Convert to strings
  const aStr = String(a);
  const bStr = String(b);
  return aStr.localeCompare(bStr);
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === 'asc' ? 'desc' : 'asc';
}