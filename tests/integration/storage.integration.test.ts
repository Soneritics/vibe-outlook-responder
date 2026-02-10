import { SettingsStorage } from '../../src/services/storage/SettingsStorage';
import { Settings } from '../../src/models/Settings';

// Mock Office.js for integration tests
const mockLocalStorage: Record<string, string> = {};
const mockRoamingSettings: Record<string, string> = {};

// Mock Office.AsyncResultStatus enum
const AsyncResultStatus = {
  Succeeded: 'succeeded',
  Failed: 'failed',
};

global.Office = {
  context: {
    roamingSettings: {
      get: jest.fn((key: string) => {
        const value = mockRoamingSettings[key];
        return value ? JSON.parse(value) : null;
      }),
      set: jest.fn((key: string, value: any) => {
        mockRoamingSettings[key] = JSON.stringify(value);
      }),
      remove: jest.fn((key: string) => {
        delete mockRoamingSettings[key];
      }),
      saveAsync: jest.fn((callback: (result: any) => void) => {
        setTimeout(() => callback({ status: AsyncResultStatus.Succeeded }), 10);
      }),
    },
  },
  AsyncResultStatus,
} as any;

// Mock localStorage
const mockLocalStorageImpl = {
  getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorageImpl,
  writable: true,
});

describe('Settings Persistence Integration', () => {
  let storage: SettingsStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    Object.keys(mockRoamingSettings).forEach((key) => delete mockRoamingSettings[key]);

    storage = new SettingsStorage();
  });

  describe('Full settings workflow', () => {
    it('should persist complete settings across save and load', async () => {
      const testSettings: Settings = {
        apiKey: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz',
        selectedModel: 'gpt-4-turbo',
        lastUpdated: new Date().toISOString(),
      };

      // Save settings
      await storage.saveSettings(testSettings);

      // Load settings
      const loadedSettings = await storage.getSettings();

      // Verify all fields persisted correctly
      expect(loadedSettings.apiKey).toBe(testSettings.apiKey);
      expect(loadedSettings.selectedModel).toBe(testSettings.selectedModel);
      expect(loadedSettings.lastUpdated).toBeDefined();
    });

    it('should handle API key encrypted in roaming settings', async () => {
      const settings: Settings = {
        apiKey: 'sk-secret-key',
        selectedModel: 'gpt-5.2',
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveSettings(settings);

      // Verify API key is NOT in localStorage (now stored encrypted in roaming)
      expect(mockLocalStorage['settings_apiKey']).toBeUndefined();

      // Verify API key IS in roaming settings (encrypted)
      expect(mockRoamingSettings['settings_apiKey']).toBeDefined();

      // Verify the stored value is encrypted (starts with enc: prefix)
      const storedKey = JSON.parse(mockRoamingSettings['settings_apiKey']);
      expect(storedKey.startsWith('enc:')).toBe(true);

      // Verify model IS in roaming settings
      expect(mockRoamingSettings['settings_selectedModel']).toBeDefined();

      // Verify decryption works
      const loaded = await storage.getSettings();
      expect(loaded.apiKey).toBe('sk-secret-key');
    });

    it('should maintain data integrity after multiple updates', async () => {
      // Initial save
      const settings1: Settings = {
        apiKey: 'sk-key1',
        selectedModel: 'gpt-5.2',
        lastUpdated: new Date().toISOString(),
      };
      await storage.saveSettings(settings1);

      // Update settings
      const settings2: Settings = {
        apiKey: 'sk-key2',
        selectedModel: 'gpt-4-turbo',
        lastUpdated: new Date().toISOString(),
      };
      await storage.saveSettings(settings2);

      // Verify latest values
      const loaded = await storage.getSettings();
      expect(loaded.apiKey).toBe('sk-key2');
      expect(loaded.selectedModel).toBe('gpt-4-turbo');
    });
  });

  describe('Cross-device sync simulation', () => {
    it('should sync model preference across devices', async () => {
      // Device 1: Save settings
      const device1Storage = new SettingsStorage();
      await device1Storage.saveSettings({
        apiKey: 'sk-device1-key',
        selectedModel: 'gpt-4-turbo',
        lastUpdated: new Date().toISOString(),
      });

      // Device 2: Load settings (simulating sync)
      // Clear local storage but keep roaming settings
      Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);

      const device2Storage = new SettingsStorage();
      const device2Settings = await device2Storage.getSettings();

      // Model should sync (from roaming)
      expect(device2Settings.selectedModel).toBe('gpt-4-turbo');

      // API key should now sync (encrypted in roaming settings)
      expect(device2Settings.apiKey).toBe('sk-device1-key');
    });
  });

  describe('Reset functionality', () => {
    it('should completely clear all settings', async () => {
      // Setup: Save some settings
      await storage.saveSettings({
        apiKey: 'sk-test-key',
        selectedModel: 'gpt-4-turbo',
        lastUpdated: new Date().toISOString(),
      });

      // Clear all settings
      await storage.clearSettings();

      // Verify everything is cleared
      const settings = await storage.getSettings();
      expect(settings.apiKey).toBe('');
      expect(settings.selectedModel).toBe('gpt-5.2'); // Default
    });

    it('should allow saving new settings after reset', async () => {
      // Save, reset, then save again
      await storage.saveSettings({
        apiKey: 'sk-first',
        selectedModel: 'gpt-4',
        lastUpdated: new Date().toISOString(),
      });

      await storage.clearSettings();

      await storage.saveSettings({
        apiKey: 'sk-second',
        selectedModel: 'gpt-5.2',
        lastUpdated: new Date().toISOString(),
      });

      const settings = await storage.getSettings();
      expect(settings.apiKey).toBe('sk-second');
      expect(settings.selectedModel).toBe('gpt-5.2');
    });
  });

  describe('Error handling', () => {
    it('should handle saveAsync failure gracefully', async () => {
      // Mock saveAsync to fail
      (Office.context.roamingSettings.saveAsync as jest.Mock).mockImplementationOnce(
        (callback: (result: any) => void) => {
          callback({ status: AsyncResultStatus.Failed, error: { message: 'Save failed' } });
        }
      );

      const settings: Settings = {
        apiKey: 'sk-test',
        selectedModel: 'gpt-5.2',
        lastUpdated: new Date().toISOString(),
      };

      await expect(storage.saveSettings(settings)).rejects.toThrow();
    });

    it('should return default settings when storage is corrupted', async () => {
      // Corrupt roaming settings
      mockRoamingSettings['settings_selectedModel'] = 'invalid-json{';

      const settings = await storage.getSettings();

      // Should fall back to defaults
      expect(settings.selectedModel).toBe('gpt-5.2');
    });
  });

  describe('Timestamp tracking', () => {
    it('should update lastUpdated on every save', async () => {
      const time1 = new Date('2024-01-01T00:00:00Z').toISOString();
      await storage.saveSettings({
        apiKey: 'sk-test',
        selectedModel: 'gpt-5.2',
        lastUpdated: time1,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const time2 = new Date('2024-01-02T00:00:00Z').toISOString();
      await storage.saveSettings({
        apiKey: 'sk-test',
        selectedModel: 'gpt-4-turbo',
        lastUpdated: time2,
      });

      const settings = await storage.getSettings();
      expect(new Date(settings.lastUpdated).getTime()).toBeGreaterThan(new Date(time1).getTime());
    });
  });
});
