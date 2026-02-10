import { Settings, SupportedModel } from '../../models/Settings';
import { encrypt, decrypt, isEncrypted } from './encryption';

const ROAMING_PREFIX = 'outlook_addin_roaming_';

/**
 * Check if Office.js roaming settings are available
 */
function isOfficeAvailable(): boolean {
  return (
    typeof Office !== 'undefined' &&
    Office.context !== undefined &&
    Office.context.roamingSettings !== undefined
  );
}

/**
 * Service for persisting user settings across sessions
 * - API key: Encrypted and stored in roaming settings (persists across Outlook restarts)
 * - Model preference: Stored in roaming settings (synced across devices)
 * Falls back to localStorage when Office is not available.
 */
export class SettingsStorage {
  private readonly STORAGE_KEYS = {
    API_KEY: 'settings_apiKey',
    SELECTED_MODEL: 'settings_selectedModel',
    LAST_UPDATED: 'settings_lastUpdated',
  };

  private readonly DEFAULT_SETTINGS: Settings = {
    apiKey: '',
    selectedModel: 'gpt-5.2',
    lastUpdated: new Date().toISOString(),
  };

  /**
   * Retrieves all settings from storage
   */
  async getSettings(): Promise<Settings> {
    try {
      const apiKey = await this.getApiKey();
      const selectedModel =
        (this.getFromRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL) as SupportedModel) ||
        this.DEFAULT_SETTINGS.selectedModel;
      const lastUpdated =
        (this.getFromRoamingSettings(this.STORAGE_KEYS.LAST_UPDATED) as string) ||
        this.DEFAULT_SETTINGS.lastUpdated;

      return {
        apiKey,
        selectedModel,
        lastUpdated,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * Get decrypted API key from roaming settings
   */
  private async getApiKey(): Promise<string> {
    try {
      const encryptedKey = this.getFromRoamingSettings(this.STORAGE_KEYS.API_KEY);
      if (!encryptedKey) {
        // Try migrating from old localStorage storage
        const oldKey = this.getFromLocalStorage(this.STORAGE_KEYS.API_KEY);
        if (oldKey) {
          // Migrate to encrypted roaming storage
          await this.saveApiKey(oldKey);
          this.removeFromLocalStorage(this.STORAGE_KEYS.API_KEY);
          return oldKey;
        }
        return '';
      }
      
      // Check if value is encrypted (for backwards compatibility)
      if (isEncrypted(encryptedKey as string)) {
        return await decrypt(encryptedKey as string);
      }
      return encryptedKey as string;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return '';
    }
  }

  /**
   * Save encrypted API key to roaming settings
   */
  private async saveApiKey(apiKey: string): Promise<void> {
    if (!apiKey) {
      this.removeFromRoamingSettings(this.STORAGE_KEYS.API_KEY);
      return;
    }
    const encryptedKey = await encrypt(apiKey);
    this.saveToRoamingSettings(this.STORAGE_KEYS.API_KEY, encryptedKey);
  }

  /**
   * Saves settings to appropriate storage locations
   * @param settings - Settings object to persist
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      // Save API key encrypted to roaming storage
      await this.saveApiKey(settings.apiKey);

      // Save other settings to roaming storage (synced across devices)
      this.saveToRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL, settings.selectedModel);

      // Update timestamp
      const timestamp = new Date().toISOString();
      this.saveToRoamingSettings(this.STORAGE_KEYS.LAST_UPDATED, timestamp);

      // Persist roaming settings
      await this.saveRoamingSettingsAsync();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Clears all settings from storage
   */
  async clearSettings(): Promise<void> {
    try {
      // Clear roaming settings
      this.removeFromRoamingSettings(this.STORAGE_KEYS.API_KEY);
      this.removeFromRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL);
      this.removeFromRoamingSettings(this.STORAGE_KEYS.LAST_UPDATED);

      // Clear old localStorage (migration cleanup)
      this.removeFromLocalStorage(this.STORAGE_KEYS.API_KEY);

      // Persist changes
      await this.saveRoamingSettingsAsync();
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw new Error('Failed to clear settings');
    }
  }

  /**
   * Checks if an API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.apiKey.trim().length > 0;
  }

  // Private helper methods

  private getFromLocalStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  private getFromRoamingSettings(key: string): unknown {
    if (isOfficeAvailable()) {
      try {
        return Office.context.roamingSettings.get(key);
      } catch (error) {
        console.error(`Error reading from roaming settings (${key}):`, error);
        return null;
      }
    }
    // Fallback to localStorage
    try {
      const value = localStorage.getItem(ROAMING_PREFIX + key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  private saveToRoamingSettings(key: string, value: unknown): void {
    if (isOfficeAvailable()) {
      try {
        Office.context.roamingSettings.set(key, value);
      } catch (error) {
        console.error(`Error writing to roaming settings (${key}):`, error);
        throw error;
      }
      return;
    }
    // Fallback to localStorage
    try {
      localStorage.setItem(ROAMING_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage fallback (${key}):`, error);
    }
  }

  private removeFromRoamingSettings(key: string): void {
    if (isOfficeAvailable()) {
      try {
        Office.context.roamingSettings.remove(key);
      } catch (error) {
        console.error(`Error removing from roaming settings (${key}):`, error);
      }
      return;
    }
    // Fallback to localStorage
    try {
      localStorage.removeItem(ROAMING_PREFIX + key);
    } catch {
      // Ignore
    }
  }

  private saveRoamingSettingsAsync(): Promise<void> {
    if (!isOfficeAvailable()) {
      // localStorage saves immediately
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        Office.context.roamingSettings.saveAsync((result: Office.AsyncResult<void>) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve();
          } else {
            reject(new Error(`Failed to save roaming settings: ${result.error?.message}`));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
