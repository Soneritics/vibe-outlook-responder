import { Settings } from '../../models/Settings';

/**
 * Service for persisting user settings across sessions
 * - API key: Stored in localStorage (local only, not synced)
 * - Model preference: Stored in roaming settings (synced across devices)
 * - Keyboard shortcuts: Stored in roaming settings (synced across devices)
 */
export class SettingsStorage {
  private readonly STORAGE_KEYS = {
    API_KEY: 'settings_apiKey',
    SELECTED_MODEL: 'settings_selectedModel',
    KEYBOARD_SHORTCUTS: 'settings_keyboardShortcuts',
    LAST_UPDATED: 'settings_lastUpdated',
  };

  private readonly DEFAULT_SETTINGS: Settings = {
    apiKey: '',
    selectedModel: 'gpt-4o',
    keyboardShortcuts: {},
    lastUpdated: new Date().toISOString(),
  };

  /**
   * Retrieves all settings from storage
   */
  async getSettings(): Promise<Settings> {
    try {
      const apiKey = this.getFromLocalStorage(this.STORAGE_KEYS.API_KEY) || '';
      const selectedModel = this.getFromRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL) || this.DEFAULT_SETTINGS.selectedModel;
      const keyboardShortcuts = this.getFromRoamingSettings(this.STORAGE_KEYS.KEYBOARD_SHORTCUTS) || {};
      const lastUpdated = this.getFromRoamingSettings(this.STORAGE_KEYS.LAST_UPDATED) || this.DEFAULT_SETTINGS.lastUpdated;

      return {
        apiKey,
        selectedModel,
        keyboardShortcuts,
        lastUpdated,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * Saves settings to appropriate storage locations
   * @param settings - Settings object to persist
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      // Save API key to localStorage only (local, not synced for security)
      this.saveToLocalStorage(this.STORAGE_KEYS.API_KEY, settings.apiKey);

      // Save other settings to roaming storage (synced across devices)
      this.saveToRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL, settings.selectedModel);
      this.saveToRoamingSettings(this.STORAGE_KEYS.KEYBOARD_SHORTCUTS, settings.keyboardShortcuts);
      
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
      // Clear localStorage
      this.removeFromLocalStorage(this.STORAGE_KEYS.API_KEY);

      // Clear roaming settings
      this.removeFromRoamingSettings(this.STORAGE_KEYS.SELECTED_MODEL);
      this.removeFromRoamingSettings(this.STORAGE_KEYS.KEYBOARD_SHORTCUTS);
      this.removeFromRoamingSettings(this.STORAGE_KEYS.LAST_UPDATED);

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

  private saveToLocalStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      throw error;
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  private getFromRoamingSettings(key: string): any {
    try {
      return Office.context.roamingSettings.get(key);
    } catch (error) {
      console.error(`Error reading from roaming settings (${key}):`, error);
      return null;
    }
  }

  private saveToRoamingSettings(key: string, value: any): void {
    try {
      Office.context.roamingSettings.set(key, value);
    } catch (error) {
      console.error(`Error writing to roaming settings (${key}):`, error);
      throw error;
    }
  }

  private removeFromRoamingSettings(key: string): void {
    try {
      Office.context.roamingSettings.remove(key);
    } catch (error) {
      console.error(`Error removing from roaming settings (${key}):`, error);
    }
  }

  private saveRoamingSettingsAsync(): Promise<void> {
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
