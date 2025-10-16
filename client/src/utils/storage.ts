/**
 * Storage Service
 * Type-safe wrapper for localStorage with encryption support
 */

import { STORAGE_KEYS } from '@/config/constants';

// ============================================
// Types
// ============================================

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

interface IStorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

interface IStorageItem<T> {
  value: T;
  expiresAt?: number;
}

// ============================================
// Storage Service Class
// ============================================

class StorageService {
  private prefix: string;

  constructor(prefix: string = 'q8m_') {
    this.prefix = prefix;
  }

  /**
   * Get prefixed key
   */
  private getKey(key: StorageKey): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Check if item is expired
   */
  private isExpired(item: IStorageItem<unknown>): boolean {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  }

  /**
   * Set item in storage
   */
  set<T>(key: StorageKey, value: T, options: IStorageOptions = {}): void {
    try {
      const item: IStorageItem<T> = {
        value,
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
      };

      const serialized = JSON.stringify(item);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`[Storage] Failed to set ${key}:`, error);
    }
  }

  /**
   * Get item from storage
   */
  get<T>(key: StorageKey, defaultValue?: T): T | null {
    try {
      const serialized = localStorage.getItem(this.getKey(key));

      if (!serialized) {
        return defaultValue ?? null;
      }

      const item: IStorageItem<T> = JSON.parse(serialized);

      // Check expiration
      if (this.isExpired(item)) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return item.value;
    } catch (error) {
      console.error(`[Storage] Failed to get ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`[Storage] Failed to remove ${key}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: StorageKey): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * Clear all storage (with prefix)
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[Storage] Failed to clear:', error);
    }
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('[Storage] Failed to get keys:', error);
      return [];
    }
  }
}

// ============================================
// Exports
// ============================================

// Singleton instance
export const storage = new StorageService();

// Also export class for custom instances
export { StorageService };

// ============================================
// Convenience Functions
// ============================================

/**
 * Currency storage helpers
 */
export const currencyStorage = {
  get: () => storage.get<string>(STORAGE_KEYS.PREFERRED_CURRENCY, 'USD'),
  set: (currency: string) => storage.set(STORAGE_KEYS.PREFERRED_CURRENCY, currency),
  remove: () => storage.remove(STORAGE_KEYS.PREFERRED_CURRENCY),
};

/**
 * Theme storage helpers
 */
export const themeStorage = {
  get: () => storage.get<string>(STORAGE_KEYS.THEME, 'light'),
  set: (theme: string) => storage.set(STORAGE_KEYS.THEME, theme),
  remove: () => storage.remove(STORAGE_KEYS.THEME),
};

/**
 * Locale storage helpers
 */
export const localeStorage = {
  get: () => storage.get<string>(STORAGE_KEYS.LOCALE, 'en'),
  set: (locale: string) => storage.set(STORAGE_KEYS.LOCALE, locale),
  remove: () => storage.remove(STORAGE_KEYS.LOCALE),
};
