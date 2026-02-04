/**
 * RoamingSync service - Office.RoamingSettings wrapper
 * Implements last-write-wins conflict resolution per FR-032b
 *
 * Office.RoamingSettings provides cross-device synchronization with ~32KB per setting limit.
 * This service wraps the Office.js API and provides a simple interface for storing/retrieving data.
 * Falls back to localStorage when Office is not available (development/testing).
 */

const STORAGE_PREFIX = 'outlook_addin_roaming_';

/**
 * Check if Office.js roaming settings are available
 */
function isOfficeAvailable(): boolean {
  return typeof Office !== 'undefined' && 
         Office.context !== undefined && 
         Office.context.roamingSettings !== undefined;
}

/**
 * Wrapper for Office.js Roaming Settings API
 * Provides cross-device synchronization for add-in data
 * Falls back to localStorage when Office is not available
 */
export class RoamingSync {
  /**
   * Get a value from roaming settings
   * @param key - The setting key
   * @returns The setting value, or null if not found
   */
  get(key: string): string | null {
    if (isOfficeAvailable()) {
      const value = Office.context.roamingSettings.get(key);
      return value !== undefined ? value : null;
    }

    // Fallback to localStorage for development
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  }

  /**
   * Set a value in roaming settings
   * Changes are stored in memory until saveAsync() is called
   * @param key - The setting key
   * @param value - The setting value (can be string, number, boolean, array, or object)
   */
  set(key: string, value: string): void {
    if (isOfficeAvailable()) {
      Office.context.roamingSettings.set(key, value);
      return;
    }

    // Fallback to localStorage for development
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Remove a value from roaming settings
   * Changes are stored in memory until saveAsync() is called
   * @param key - The setting key to remove
   */
  remove(key: string): void {
    if (isOfficeAvailable()) {
      Office.context.roamingSettings.remove(key);
      return;
    }

    // Fallback to localStorage for development
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Save all changes to roaming settings
   * This persists all set() and remove() operations
   * Implements last-write-wins conflict resolution (no conflict detection per FR-032b)
   * @returns Promise that resolves when save is complete
   */
  async saveAsync(): Promise<void> {
    if (!isOfficeAvailable()) {
      // localStorage saves immediately, no need for async save
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      Office.context.roamingSettings.saveAsync((result: Office.AsyncResult<void>) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve();
        } else {
          const errorMessage = result.error?.message || 'Failed to save roaming settings';
          reject(new Error(errorMessage));
        }
      });
    });
  }
}
