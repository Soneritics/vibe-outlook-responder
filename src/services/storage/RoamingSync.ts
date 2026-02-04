/**
 * RoamingSync service - Office.RoamingSettings wrapper
 * Implements last-write-wins conflict resolution per FR-032b
 *
 * Office.RoamingSettings provides cross-device synchronization with ~32KB per setting limit.
 * This service wraps the Office.js API and provides a simple interface for storing/retrieving data.
 */

/**
 * Wrapper for Office.js Roaming Settings API
 * Provides cross-device synchronization for add-in data
 */
export class RoamingSync {
  /**
   * Get a value from roaming settings
   * @param key - The setting key
   * @returns The setting value, or null if not found, or undefined if Office not available
   */
  get(key: string): any {
    if (typeof Office === 'undefined' || !Office.context?.roamingSettings) {
      return undefined;
    }

    return Office.context.roamingSettings.get(key);
  }

  /**
   * Set a value in roaming settings
   * Changes are stored in memory until saveAsync() is called
   * @param key - The setting key
   * @param value - The setting value (can be string, number, boolean, array, or object)
   */
  set(key: string, value: any): void {
    if (typeof Office === 'undefined' || !Office.context?.roamingSettings) {
      return;
    }

    Office.context.roamingSettings.set(key, value);
  }

  /**
   * Remove a value from roaming settings
   * Changes are stored in memory until saveAsync() is called
   * @param key - The setting key to remove
   */
  remove(key: string): void {
    if (typeof Office === 'undefined' || !Office.context?.roamingSettings) {
      return;
    }

    Office.context.roamingSettings.remove(key);
  }

  /**
   * Save all changes to roaming settings
   * This persists all set() and remove() operations
   * Implements last-write-wins conflict resolution (no conflict detection per FR-032b)
   * @returns Promise that resolves when save is complete
   * @throws Error if save fails or Office not available
   */
  async saveAsync(): Promise<void> {
    if (typeof Office === 'undefined' || !Office.context?.roamingSettings) {
      throw new Error('Office roaming settings not available');
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
