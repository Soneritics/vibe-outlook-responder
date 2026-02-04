import { Settings } from '../../models/Settings';
/**
 * Service for persisting user settings across sessions
 * - API key: Stored in localStorage (local only, not synced)
 * - Model preference: Stored in roaming settings (synced across devices)
 * - Keyboard shortcuts: Stored in roaming settings (synced across devices)
 * Falls back to localStorage when Office is not available.
 */
export declare class SettingsStorage {
    private readonly STORAGE_KEYS;
    private readonly DEFAULT_SETTINGS;
    /**
     * Retrieves all settings from storage
     */
    getSettings(): Promise<Settings>;
    /**
     * Saves settings to appropriate storage locations
     * @param settings - Settings object to persist
     */
    saveSettings(settings: Settings): Promise<void>;
    /**
     * Clears all settings from storage
     */
    clearSettings(): Promise<void>;
    /**
     * Checks if an API key is configured
     */
    hasApiKey(): Promise<boolean>;
    private getFromLocalStorage;
    private saveToLocalStorage;
    private removeFromLocalStorage;
    private getFromRoamingSettings;
    private saveToRoamingSettings;
    private removeFromRoamingSettings;
    private saveRoamingSettingsAsync;
}
//# sourceMappingURL=SettingsStorage.d.ts.map