/**
 * RoamingSync service - Office.RoamingSettings wrapper
 * Implements last-write-wins conflict resolution per FR-032b
 *
 * Office.RoamingSettings provides cross-device synchronization with ~32KB per setting limit.
 * This service wraps the Office.js API and provides a simple interface for storing/retrieving data.
 * Falls back to localStorage when Office is not available (development/testing).
 */
/**
 * Wrapper for Office.js Roaming Settings API
 * Provides cross-device synchronization for add-in data
 * Falls back to localStorage when Office is not available
 */
export declare class RoamingSync {
    /**
     * Get a value from roaming settings
     * @param key - The setting key
     * @returns The setting value, or null if not found
     */
    get(key: string): string | null;
    /**
     * Set a value in roaming settings
     * Changes are stored in memory until saveAsync() is called
     * @param key - The setting key
     * @param value - The setting value (can be string, number, boolean, array, or object)
     */
    set(key: string, value: string): void;
    /**
     * Remove a value from roaming settings
     * Changes are stored in memory until saveAsync() is called
     * @param key - The setting key to remove
     */
    remove(key: string): void;
    /**
     * Save all changes to roaming settings
     * This persists all set() and remove() operations
     * Implements last-write-wins conflict resolution (no conflict detection per FR-032b)
     * @returns Promise that resolves when save is complete
     */
    saveAsync(): Promise<void>;
}
//# sourceMappingURL=RoamingSync.d.ts.map