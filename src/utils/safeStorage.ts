/**
 * Safe LocalStorage Utility
 * Protects against QuotaExceededError, SSR issues, disabled storage, and JSON errors.
 */

export const safeStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined || item === '') {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[safeStorage] Error reading key "${key}":`, e);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const stringified = JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
      return true;
    } catch (e: any) {
      console.warn(`[safeStorage] Error writing key "${key}" to localStorage:`, e);
      // If QuotaExceededError, try clearing non-essential caches
      try {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
          // Clear large temporary keys to free up space
          const keysToClean = ['rtg_cached_temp', 'rtg_debug_logs'];
          keysToClean.forEach(k => window.localStorage.removeItem(k));
          // Try once more with value
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        }
      } catch {
        // Silently catch to never crash React tree
      }
      return false;
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};
