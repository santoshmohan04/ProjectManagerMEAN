/**
 * Local state utilities
 * Pure functions for managing local component state
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj.getTime()) as T;

  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;

  if (typeof obj === 'object') {
    const clonedObj = {} as Record<string, any>;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as Record<string, any>)[key]);
      }
    }
    return clonedObj as T;
  }

  return obj;
}

/**
 * Merge two objects deeply
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        (result as Record<string, any>)[key] = deepMerge(
          targetValue as Record<string, any>,
          sourceValue as Partial<Record<string, any>>
        );
      } else {
        (result as Record<string, any>)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Check if value is a plain object
 */
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Create a simple state manager for local component state
 */
export class LocalStateManager<T extends Record<string, any>> {
  private state: T;

  constructor(initialState: T) {
    this.state = deepClone(initialState);
  }

  /**
   * Get current state
   */
  getState(): T {
    return deepClone(this.state);
  }

  /**
   * Update state partially
   */
  update(updates: Partial<T>): T {
    this.state = deepMerge(this.state, updates);
    return this.getState();
  }

  /**
   * Set state completely
   */
  setState(newState: T): T {
    this.state = deepClone(newState);
    return this.getState();
  }

  /**
   * Reset to initial state
   */
  reset(initialState: T): T {
    this.state = deepClone(initialState);
    return this.getState();
  }

  /**
   * Get specific property
   */
  get<K extends keyof T>(key: K): T[K] {
    return deepClone(this.state[key]);
  }

  /**
   * Update specific property
   */
  set<K extends keyof T>(key: K, value: T[K]): T {
    this.state[key] = deepClone(value);
    return this.getState();
  }
}

/**
 * Create a local state manager instance
 */
export function createLocalStateManager<T extends Record<string, any>>(
  initialState: T
): LocalStateManager<T> {
  return new LocalStateManager(initialState);
}

/**
 * Simple cache utility for local storage
 */
export class LocalCache {
  private static instance: LocalCache;
  private cache = new Map<string, any>();

  static getInstance(): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache();
    }
    return LocalCache.instance;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const item = {
      value: deepClone(value),
      timestamp: Date.now(),
      ttl
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return deepClone(item.value);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Get local cache instance
 */
export function getLocalCache(): LocalCache {
  return LocalCache.getInstance();
}