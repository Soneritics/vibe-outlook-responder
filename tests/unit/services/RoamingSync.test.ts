/**
 * Unit tests for RoamingSync service
 * Tests Office.RoamingSettings wrapper with last-write-wins conflict resolution
 */

import { RoamingSync } from '../../../src/services/storage/RoamingSync';

// Define AsyncResultStatus before using it
const AsyncResultStatus = {
  Succeeded: 0 as const,
  Failed: 1 as const,
};

describe('RoamingSync', () => {
  let roamingSync: RoamingSync;
  let mockRoamingSettings: any;

  beforeEach(() => {
    // Mock Office.context.roamingSettings
    mockRoamingSettings = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      saveAsync: jest.fn((callback) => {
        Promise.resolve().then(() => {
          callback({
            status: AsyncResultStatus.Succeeded,
            value: null,
            error: null,
          } as Office.AsyncResult<void>);
        });
      }),
    };

    // Mock Office.context
    global.Office = {
      context: {
        roamingSettings: mockRoamingSettings,
      },
      AsyncResultStatus,
    } as any;

    roamingSync = new RoamingSync();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve value from roaming settings', () => {
      const testValue = 'test data';
      mockRoamingSettings.get.mockReturnValue(testValue);

      const result = roamingSync.get('testKey');

      expect(result).toBe(testValue);
      expect(mockRoamingSettings.get).toHaveBeenCalledWith('testKey');
    });

    it('should return null if key does not exist', () => {
      mockRoamingSettings.get.mockReturnValue(null);

      const result = roamingSync.get('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should return null if roaming settings not available (falls back to localStorage)', () => {
      global.Office = undefined as any;
      roamingSync = new RoamingSync();

      const result = roamingSync.get('testKey');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value in roaming settings', () => {
      roamingSync.set('testKey', 'test value');

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('testKey', 'test value');
    });

    it('should handle null values', () => {
      roamingSync.set('testKey', null);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('testKey', null);
    });

    it('should handle complex objects', () => {
      const complexObject = { nested: { data: [1, 2, 3] } };
      roamingSync.set('testKey', complexObject);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('testKey', complexObject);
    });

    it('should do nothing if roaming settings not available', () => {
      global.Office = undefined as any;
      roamingSync = new RoamingSync();

      roamingSync.set('testKey', 'test value');

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove value from roaming settings', () => {
      roamingSync.remove('testKey');

      expect(mockRoamingSettings.remove).toHaveBeenCalledWith('testKey');
    });

    it('should do nothing if roaming settings not available', () => {
      global.Office = undefined as any;
      roamingSync = new RoamingSync();

      roamingSync.remove('testKey');

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('saveAsync', () => {
    it('should save settings asynchronously', async () => {
      await roamingSync.saveAsync();

      expect(mockRoamingSettings.saveAsync).toHaveBeenCalled();
    });

    it('should resolve on successful save', async () => {
      mockRoamingSettings.saveAsync.mockImplementation((callback: any) => {
        callback({ status: Office.AsyncResultStatus.Succeeded, value: null, error: null });
      });

      await expect(roamingSync.saveAsync()).resolves.toBeUndefined();
    });

    it('should reject on failed save', async () => {
      const errorMessage = 'Save failed';
      mockRoamingSettings.saveAsync.mockImplementation((callback: any) => {
        callback({
          status: Office.AsyncResultStatus.Failed,
          error: { message: errorMessage },
          value: null,
        });
      });

      await expect(roamingSync.saveAsync()).rejects.toThrow(errorMessage);
    });

    it('should resolve if roaming settings not available (falls back to localStorage)', async () => {
      global.Office = undefined as any;
      roamingSync = new RoamingSync();

      // Should not throw, instead it returns immediately since localStorage saves are sync
      await expect(roamingSync.saveAsync()).resolves.toBeUndefined();
    });

    it('should handle undefined error object', async () => {
      mockRoamingSettings.saveAsync.mockImplementation((callback: any) => {
        callback({
          status: Office.AsyncResultStatus.Failed,
          error: undefined,
          value: null,
        });
      });

      await expect(roamingSync.saveAsync()).rejects.toThrow('Failed to save roaming settings');
    });
  });

  describe('last-write-wins conflict resolution', () => {
    it('should implement last-write-wins by overwriting existing values', () => {
      // Simulate first write
      mockRoamingSettings.get.mockReturnValue('old value');
      roamingSync.set('testKey', 'old value');

      // Simulate second write (should overwrite)
      roamingSync.set('testKey', 'new value');

      // Verify last write wins
      expect(mockRoamingSettings.set).toHaveBeenLastCalledWith('testKey', 'new value');
    });

    it('should not implement conflict detection (last-write-wins per FR-032b)', () => {
      // No conflict detection logic should exist
      // Simply verify that set always overwrites
      roamingSync.set('testKey', 'value1');
      roamingSync.set('testKey', 'value2');
      roamingSync.set('testKey', 'value3');

      expect(mockRoamingSettings.set).toHaveBeenCalledTimes(3);
      expect(mockRoamingSettings.set).toHaveBeenLastCalledWith('testKey', 'value3');
    });
  });

  describe('storage limits', () => {
    it('should handle data within roaming settings size limits', () => {
      // Office roaming settings limit is typically 32KB per setting
      const largeData = 'x'.repeat(30000); // 30KB
      roamingSync.set('largeKey', largeData);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('largeKey', largeData);
    });

    it('should allow multiple keys within total limit', () => {
      roamingSync.set('key1', 'data1');
      roamingSync.set('key2', 'data2');
      roamingSync.set('key3', 'data3');

      expect(mockRoamingSettings.set).toHaveBeenCalledTimes(3);
    });
  });

  describe('serialization', () => {
    it('should handle string values directly', () => {
      const stringValue = 'simple string';
      roamingSync.set('key', stringValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', stringValue);
    });

    it('should handle number values', () => {
      const numberValue = 42;
      roamingSync.set('key', numberValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', numberValue);
    });

    it('should handle boolean values', () => {
      const boolValue = true;
      roamingSync.set('key', boolValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', boolValue);
    });

    it('should handle array values', () => {
      const arrayValue = [1, 2, 3];
      roamingSync.set('key', arrayValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', arrayValue);
    });

    it('should handle object values', () => {
      const objectValue = { prop1: 'value1', prop2: 42 };
      roamingSync.set('key', objectValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', objectValue);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      roamingSync.set('key', '');

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', '');
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key-with_special.chars:123';
      roamingSync.set(specialKey, 'value');

      expect(mockRoamingSettings.set).toHaveBeenCalledWith(specialKey, 'value');
    });

    it('should handle Unicode characters in values', () => {
      const unicodeValue = '你好世界 🌍';
      roamingSync.set('key', unicodeValue);

      expect(mockRoamingSettings.set).toHaveBeenCalledWith('key', unicodeValue);
    });
  });
});
