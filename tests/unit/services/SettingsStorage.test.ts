import { SettingsStorage } from '../../../src/services/storage/SettingsStorage';
import { Settings } from '../../../src/models/Settings';

// Mock Office.js
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
        // Use setTimeout to simulate async behavior properly
        setImmediate(() => {
          callback({ status: AsyncResultStatus.Succeeded });
        });
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

describe('SettingsStorage', () => {
  let storage: SettingsStorage;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
    Object.keys(mockRoamingSettings).forEach((key) => delete mockRoamingSettings[key]);

    storage = new SettingsStorage();
  });

  describe('getSettings', () => {
    it('should return default settings when no settings exist', async () => {
      const settings = await storage.getSettings();

      expect(settings).toEqual({
        apiKey: '',
        selectedModel: 'gpt-4o',
        keyboardShortcuts: {},
        lastUpdated: expect.any(String),
      });
    });

    it('should return stored API key from localStorage', async () => {
      mockLocalStorage['settings_apiKey'] = 'sk-test123';

      const settings = await storage.getSettings();

      expect(settings.apiKey).toBe('sk-test123');
    });

    it('should return stored model from roaming settings', async () => {
      mockRoamingSettings['settings_selectedModel'] = JSON.stringify('gpt-4');

      const settings = await storage.getSettings();

      expect(settings.selectedModel).toBe('gpt-4');
    });

    it('should return keyboard shortcuts from roaming settings', async () => {
      const shortcuts = { openPrompts: 'Ctrl+Shift+P' };
      mockRoamingSettings['settings_keyboardShortcuts'] = JSON.stringify(shortcuts);

      const settings = await storage.getSettings();

      expect(settings.keyboardShortcuts).toEqual(shortcuts);
    });
  });

  describe('saveSettings', () => {
    it('should save API key to localStorage only', async () => {
      const settings: Settings = {
        apiKey: 'sk-new-key',
        selectedModel: 'gpt-4o',
        keyboardShortcuts: {},
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveSettings(settings);

      expect(mockLocalStorageImpl.setItem).toHaveBeenCalledWith('settings_apiKey', 'sk-new-key');
      expect(Office.context.roamingSettings.set).not.toHaveBeenCalledWith(
        'settings_apiKey',
        expect.anything()
      );
    });

    it('should save model to roaming settings', async () => {
      const settings: Settings = {
        apiKey: 'sk-test',
        selectedModel: 'gpt-4-turbo',
        keyboardShortcuts: {},
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveSettings(settings);

      expect(Office.context.roamingSettings.set).toHaveBeenCalledWith(
        'settings_selectedModel',
        'gpt-4-turbo'
      );
    });

    it('should save keyboard shortcuts to roaming settings', async () => {
      const shortcuts = { openPrompts: 'Ctrl+Shift+P', generateResponse: 'Ctrl+Enter' };
      const settings: Settings = {
        apiKey: 'sk-test',
        selectedModel: 'gpt-4o',
        keyboardShortcuts: shortcuts,
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveSettings(settings);

      expect(Office.context.roamingSettings.set).toHaveBeenCalledWith(
        'settings_keyboardShortcuts',
        shortcuts
      );
    });

    it('should call saveAsync to persist roaming settings', async () => {
      const settings: Settings = {
        apiKey: 'sk-test',
        selectedModel: 'gpt-4o',
        keyboardShortcuts: {},
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveSettings(settings);

      expect(Office.context.roamingSettings.saveAsync).toHaveBeenCalled();
    });

    it('should update lastUpdated timestamp', async () => {
      const beforeTime = new Date().toISOString();
      const settings: Settings = {
        apiKey: 'sk-test',
        selectedModel: 'gpt-4o',
        keyboardShortcuts: {},
        lastUpdated: beforeTime,
      };

      await storage.saveSettings(settings);

      const savedSettings = await storage.getSettings();
      expect(new Date(savedSettings.lastUpdated).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
    });
  });

  describe('clearSettings', () => {
    it('should remove API key from localStorage', async () => {
      mockLocalStorage['settings_apiKey'] = 'sk-test';

      await storage.clearSettings();

      expect(mockLocalStorageImpl.removeItem).toHaveBeenCalledWith('settings_apiKey');
    });

    it('should remove all settings from roaming settings', async () => {
      mockRoamingSettings['settings_selectedModel'] = JSON.stringify('gpt-4');
      mockRoamingSettings['settings_keyboardShortcuts'] = JSON.stringify({});

      await storage.clearSettings();

      expect(Office.context.roamingSettings.remove).toHaveBeenCalledWith('settings_selectedModel');
      expect(Office.context.roamingSettings.remove).toHaveBeenCalledWith(
        'settings_keyboardShortcuts'
      );
      expect(Office.context.roamingSettings.remove).toHaveBeenCalledWith('settings_lastUpdated');
    });

    it('should call saveAsync after clearing', async () => {
      await storage.clearSettings();

      expect(Office.context.roamingSettings.saveAsync).toHaveBeenCalled();
    });
  });

  describe('hasApiKey', () => {
    it('should return false when no API key is stored', async () => {
      const hasKey = await storage.hasApiKey();

      expect(hasKey).toBe(false);
    });

    it('should return true when API key is stored', async () => {
      mockLocalStorage['settings_apiKey'] = 'sk-test123';

      const hasKey = await storage.hasApiKey();

      expect(hasKey).toBe(true);
    });

    it('should return false for empty API key', async () => {
      mockLocalStorage['settings_apiKey'] = '';

      const hasKey = await storage.hasApiKey();

      expect(hasKey).toBe(false);
    });
  });
});
