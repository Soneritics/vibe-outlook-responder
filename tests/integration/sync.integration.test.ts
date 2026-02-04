/**
 * Integration tests for prompt synchronization
 * Tests RoamingSync + PromptStorage integration with Office.RoamingSettings
 */

import { PromptStorage } from '../../src/services/storage/PromptStorage';
import { RoamingSync } from '../../src/services/storage/RoamingSync';

describe('Prompt Sync Integration', () => {
  let storage: PromptStorage;
  let mockRoamingSettingsData: Map<string, any>;

  beforeEach(() => {
    // Create in-memory storage to simulate Office.RoamingSettings
    mockRoamingSettingsData = new Map();

    // Mock Office.context.roamingSettings
    global.Office = {
      context: {
        roamingSettings: {
          get: jest.fn((key: string) => mockRoamingSettingsData.get(key)),
          set: jest.fn((key: string, value: any) => mockRoamingSettingsData.set(key, value)),
          remove: jest.fn((key: string) => mockRoamingSettingsData.delete(key)),
          saveAsync: jest.fn((callback: any) => {
            // Simulate successful async save
            setTimeout(() => {
              callback({
                status: Office.AsyncResultStatus.Succeeded,
                value: null,
                error: null,
              });
            }, 0);
          }),
        },
      },
      AsyncResultStatus: {
        Succeeded: 0,
        Failed: 1,
      },
    } as any;

    storage = new PromptStorage();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRoamingSettingsData.clear();
  });

  describe('Cross-device synchronization', () => {
    it('should sync newly created prompt across devices', async () => {
      // Device 1: Create a prompt
      const device1Storage = new PromptStorage();
      const newPrompt = await device1Storage.create({
        title: 'Meeting Response',
        content: 'Thank you for the meeting invitation.',
      });

      // Simulate roaming settings sync (same storage)
      const device2Storage = new PromptStorage();
      const syncedPrompts = await device2Storage.getAll();

      expect(syncedPrompts).toHaveLength(1);
      expect(syncedPrompts[0].id).toBe(newPrompt.id);
      expect(syncedPrompts[0].title).toBe('Meeting Response');
    });

    it('should sync updated prompt across devices', async () => {
      // Device 1: Create initial prompt
      const device1Storage = new PromptStorage();
      const prompt = await device1Storage.create({
        title: 'Original Title',
        content: 'Original content',
      });

      // Device 2: Update the prompt
      const device2Storage = new PromptStorage();
      await device2Storage.update(prompt.id, {
        title: 'Updated Title',
        content: 'Updated content',
      });

      // Device 1: Read updated prompt
      const updatedPrompt = await device1Storage.getById(prompt.id);

      expect(updatedPrompt).not.toBeNull();
      expect(updatedPrompt!.title).toBe('Updated Title');
      expect(updatedPrompt!.content).toBe('Updated content');
    });

    it('should sync deleted prompt across devices', async () => {
      // Device 1: Create prompt
      const device1Storage = new PromptStorage();
      const prompt = await device1Storage.create({
        title: 'To Be Deleted',
        content: 'Content',
      });

      // Device 2: Delete the prompt
      const device2Storage = new PromptStorage();
      await device2Storage.delete(prompt.id);

      // Device 1: Verify deletion
      const deletedPrompt = await device1Storage.getById(prompt.id);
      const allPrompts = await device1Storage.getAll();

      expect(deletedPrompt).toBeNull();
      expect(allPrompts).toHaveLength(0);
    });

    it('should handle multiple prompts syncing', async () => {
      const storage1 = new PromptStorage();

      // Create multiple prompts
      await storage1.create({ title: 'Prompt 1', content: 'Content 1' });
      await storage1.create({ title: 'Prompt 2', content: 'Content 2' });
      await storage1.create({ title: 'Prompt 3', content: 'Content 3' });

      // Verify all synced
      const storage2 = new PromptStorage();
      const syncedPrompts = await storage2.getAll();

      expect(syncedPrompts).toHaveLength(3);
      expect(syncedPrompts.map((p) => p.title)).toEqual(['Prompt 1', 'Prompt 2', 'Prompt 3']);
    });
  });

  describe('Last-write-wins conflict resolution (FR-032b)', () => {
    it('should implement last-write-wins when two devices edit same prompt', async () => {
      // Device 1: Create prompt
      const device1Storage = new PromptStorage();
      const prompt = await device1Storage.create({
        title: 'Conflict Test',
        content: 'Original content',
      });

      // Simulate concurrent edits
      // Device 1: Edit
      await device1Storage.update(prompt.id, {
        content: 'Device 1 edit',
      });

      // Device 2: Edit (happens after, should win)
      const device2Storage = new PromptStorage();
      await device2Storage.update(prompt.id, {
        content: 'Device 2 edit',
      });

      // Verify last write wins
      const finalPrompt = await device1Storage.getById(prompt.id);

      expect(finalPrompt!.content).toBe('Device 2 edit');
    });

    it('should not detect or prevent conflicts', async () => {
      // This test verifies that NO conflict detection is implemented
      const storage1 = new PromptStorage();
      const storage2 = new PromptStorage();

      const prompt = await storage1.create({
        title: 'No Conflict Detection',
        content: 'Original',
      });

      // Multiple writes should all succeed (last one wins)
      await storage1.update(prompt.id, { content: 'Edit 1' });
      await storage2.update(prompt.id, { content: 'Edit 2' });
      await storage1.update(prompt.id, { content: 'Edit 3' });

      const finalPrompt = await storage1.getById(prompt.id);
      expect(finalPrompt!.content).toBe('Edit 3');

      // No errors should have been thrown
      expect(true).toBe(true);
    });
  });

  describe('Roaming settings persistence', () => {
    it('should persist prompts to roaming settings', async () => {
      const storage = new PromptStorage();

      await storage.create({
        title: 'Persistent Prompt',
        content: 'Should be saved',
      });

      // Verify data is in roaming settings
      const savedData = mockRoamingSettingsData.get('prompts');
      expect(savedData).toBeDefined();

      const prompts = JSON.parse(savedData);
      expect(prompts).toHaveLength(1);
      expect(prompts[0].title).toBe('Persistent Prompt');
    });

    it('should load prompts from roaming settings on initialization', async () => {
      // Pre-populate roaming settings
      const existingPrompts = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Existing content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];
      mockRoamingSettingsData.set('prompts', JSON.stringify(existingPrompts));

      // Create new storage instance
      const storage = new PromptStorage();
      const prompts = await storage.getAll();

      expect(prompts).toHaveLength(1);
      expect(prompts[0].title).toBe('Existing Prompt');
    });

    it('should handle empty roaming settings gracefully', async () => {
      // No data in roaming settings
      const storage = new PromptStorage();
      const prompts = await storage.getAll();

      expect(prompts).toEqual([]);
    });

    it('should handle corrupted roaming settings data', async () => {
      // Corrupted JSON data
      mockRoamingSettingsData.set('prompts', 'corrupted-json{[}');

      const storage = new PromptStorage();
      const prompts = await storage.getAll();

      expect(prompts).toEqual([]);
    });
  });

  describe('Async operations', () => {
    it('should wait for saveAsync to complete', async () => {
      const storage = new PromptStorage();
      const saveAsyncSpy = jest.spyOn(Office.context.roamingSettings, 'saveAsync');

      await storage.create({
        title: 'Async Test',
        content: 'Content',
      });

      expect(saveAsyncSpy).toHaveBeenCalled();
    });

    it('should handle saveAsync failures gracefully', async () => {
      // Mock saveAsync to fail
      global.Office.context.roamingSettings.saveAsync = jest.fn((callback: any) => {
        callback({
          status: Office.AsyncResultStatus.Failed,
          error: { message: 'Save failed' },
          value: null,
        });
      });

      const storage = new PromptStorage();

      await expect(
        storage.create({
          title: 'Fail Test',
          content: 'Content',
        })
      ).rejects.toThrow('Save failed');
    });
  });

  describe('Data integrity', () => {
    it('should maintain prompt order after sync', async () => {
      const storage = new PromptStorage();

      await storage.create({ title: 'Alpha', content: 'A' });
      await storage.create({ title: 'Bravo', content: 'B' });
      await storage.create({ title: 'Charlie', content: 'C' });

      const prompts = await storage.getAll();

      // Should be alphabetically sorted
      expect(prompts[0].title).toBe('Alpha');
      expect(prompts[1].title).toBe('Bravo');
      expect(prompts[2].title).toBe('Charlie');
    });

    it('should preserve all prompt fields during sync', async () => {
      const storage = new PromptStorage();

      const created = await storage.create({
        title: 'Complete Prompt',
        content: 'Full content',
      });

      // Read back
      const retrieved = await storage.getById(created.id);

      expect(retrieved).toMatchObject({
        id: created.id,
        title: 'Complete Prompt',
        content: 'Full content',
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
    });

    it('should handle special characters in title and content', async () => {
      const storage = new PromptStorage();

      const prompt = await storage.create({
        title: 'Special: <>&"\'',
        content: 'Content with 你好 emojis 🎉',
      });

      const retrieved = await storage.getById(prompt.id);

      expect(retrieved!.title).toBe('Special: <>&"\'');
      expect(retrieved!.content).toBe('Content with 你好 emojis 🎉');
    });
  });

  describe('Performance', () => {
    it('should handle large number of prompts efficiently', async () => {
      const storage = new PromptStorage();

      // Create 50 prompts
      const createPromises = Array.from({ length: 50 }, (_, i) =>
        storage.create({
          title: `Prompt ${i}`,
          content: `Content ${i}`,
        })
      );

      await Promise.all(createPromises);

      const startTime = Date.now();
      const allPrompts = await storage.getAll();
      const duration = Date.now() - startTime;

      expect(allPrompts).toHaveLength(50);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should handle prompts with maximum character limits', async () => {
      const storage = new PromptStorage();

      const maxTitle = 'x'.repeat(100);
      const maxContent = 'y'.repeat(10000);

      const prompt = await storage.create({
        title: maxTitle,
        content: maxContent,
      });

      const retrieved = await storage.getById(prompt.id);

      expect(retrieved!.title).toHaveLength(100);
      expect(retrieved!.content).toHaveLength(10000);
    });
  });
});
