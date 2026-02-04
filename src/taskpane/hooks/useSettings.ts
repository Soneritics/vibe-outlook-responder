import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../../models/Settings';
import { SettingsStorage } from '../../services/storage/SettingsStorage';

interface UseSettingsReturn {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  hasApiKey: boolean;
}

/**
 * Custom hook for managing user settings
 * Handles loading, saving, and resetting settings with proper state management
 */
export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    selectedModel: 'gpt-4o',
    keyboardShortcuts: {},
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storage] = useState(() => new SettingsStorage());

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedSettings = await storage.getSettings();
        setSettings(loadedSettings);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [storage]);

  /**
   * Updates settings with new values
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>) => {
      try {
        setError(null);
        const updatedSettings: Settings = {
          ...settings,
          ...newSettings,
          lastUpdated: new Date().toISOString(),
        };
        
        await storage.saveSettings(updatedSettings);
        setSettings(updatedSettings);
      } catch (err) {
        setError('Failed to save settings');
        console.error('Error saving settings:', err);
        throw err;
      }
    },
    [settings, storage]
  );

  /**
   * Resets all settings to defaults
   */
  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      await storage.clearSettings();
      const defaultSettings = await storage.getSettings();
      setSettings(defaultSettings);
    } catch (err) {
      setError('Failed to reset settings');
      console.error('Error resetting settings:', err);
      throw err;
    }
  }, [storage]);

  const hasApiKey = settings.apiKey.trim().length > 0;

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    hasApiKey,
  };
};
