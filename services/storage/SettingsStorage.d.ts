import { Settings } from '../../models/Settings';
/**
 * Service for persisting user settings across sessions
 * - API key: Encrypted and stored in roaming settings (persists across Outlook restarts)
 * - Model preference: Stored in roaming settings (synced across devices)
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
     * Get decrypted API key from roaming settings
     */
    private getApiKey;
    /**
     * Save encrypted API key to roaming settings
     */
    private saveApiKey;
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
    private removeFromLocalStorage;
    private getFromRoamingSettings;
    private saveToRoamingSettings;
    private removeFromRoamingSettings;
    private saveRoamingSettingsAsync;
}
//# sourceMappingURL=SettingsStorage.d.ts.map