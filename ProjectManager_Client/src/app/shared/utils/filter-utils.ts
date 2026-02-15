/**
 * Filter and search utilities
 * Pure functions for filtering arrays of objects
 */

/**
 * Generic filter function for arrays of objects
 */
export function filterByText<T>(
  array: T[],
  searchText: string,
  keys: (keyof T)[]
): T[] {
  if (!searchText.trim()) return array;

  const searchLower = searchText.toLowerCase();

  return array.filter(item =>
    keys.some(key => {
      const value = item[key];
      if (value == null) return false;

      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchLower);
    })
  );
}

/**
 * Filter by multiple criteria
 */
export function filterByMultipleCriteria<T>(
  array: T[],
  filters: Partial<Record<keyof T, any>>
): T[] {
  return array.filter(item =>
    Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue == null || filterValue === '') return true;

      const itemValue = item[key as keyof T];

      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }

      if (typeof filterValue === 'number') {
        return itemValue === filterValue;
      }

      if (filterValue instanceof Date) {
        return itemValue instanceof Date && itemValue.getTime() === filterValue.getTime();
      }

      return itemValue === filterValue;
    })
  );
}

/**
 * Filter by date range
 */
export function filterByDateRange<T>(
  array: T[],
  dateKey: keyof T,
  startDate?: Date,
  endDate?: Date
): T[] {
  return array.filter(item => {
    const itemDate = item[dateKey];

    if (!(itemDate instanceof Date)) return true;

    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;

    return true;
  });
}

/**
 * Filter by numeric range
 */
export function filterByNumericRange<T>(
  array: T[],
  key: keyof T,
  min?: number,
  max?: number
): T[] {
  return array.filter(item => {
    const value = item[key];

    if (typeof value !== 'number') return true;

    if (min != null && value < min) return false;
    if (max != null && value > max) return false;

    return true;
  });
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a search predicate function
 */
export function createSearchPredicate<T>(
  searchText: string,
  keys: (keyof T)[]
): (item: T) => boolean {
  if (!searchText.trim()) return () => true;

  const searchLower = searchText.toLowerCase();

  return (item: T) =>
    keys.some(key => {
      const value = item[key];
      if (value == null) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
}

/**
 * Get nested object value by dot notation path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}