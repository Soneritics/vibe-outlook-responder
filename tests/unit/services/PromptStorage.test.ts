/**
 * Unit tests for PromptStorage service
 * Tests CRUD operations with roaming sync integration
 */

import { PromptStorage } from '../../../src/services/storage/PromptStorage';
import { RoamingSync } from '../../../src/services/storage/RoamingSync';
import { Prompt } from '../../../src/models/Prompt';

// Mock RoamingSync
jest.mock('../../../src/services/storage/RoamingSync');

describe('PromptStorage', () => {
  let storage: PromptStorage;
  let mockRoamingSync: jest.Mocked<RoamingSync>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock RoamingSync instance
    mockRoamingSync = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      saveAsync: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock the RoamingSync constructor
    (RoamingSync as jest.MockedClass<typeof RoamingSync>).mockImplementation(() => mockRoamingSync);

    // Create storage instance
    storage = new PromptStorage();
  });

  describe('getAll', () => {
    it('should return empty array when no prompts exist', async () => {
      mockRoamingSync.get.mockReturnValue(null);

      const prompts = await storage.getAll();

      expect(prompts).toEqual([]);
      expect(mockRoamingSync.get).toHaveBeenCalledWith('prompts');
    });

    it('should return all prompts from roaming storage', async () => {
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Test Prompt',
          content: 'Test content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(mockPrompts));

      const prompts = await storage.getAll();

      expect(prompts).toEqual(mockPrompts);
      expect(mockRoamingSync.get).toHaveBeenCalledWith('prompts');
    });

    it('should return empty array when JSON parsing fails', async () => {
      mockRoamingSync.get.mockReturnValue('invalid json');

      const prompts = await storage.getAll();

      expect(prompts).toEqual([]);
    });

    it('should sort prompts alphabetically by title', async () => {
      const mockPrompts: Prompt[] = [
        {
          id: '3',
          title: 'Zebra',
          content: 'Z content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '1',
          title: 'Apple',
          content: 'A content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Banana',
          content: 'B content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(mockPrompts));

      const prompts = await storage.getAll();

      expect(prompts[0].title).toBe('Apple');
      expect(prompts[1].title).toBe('Banana');
      expect(prompts[2].title).toBe('Zebra');
    });
  });

  describe('getById', () => {
    it('should return prompt by id', async () => {
      const mockPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Test Prompt',
          content: 'Test content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Another Prompt',
          content: 'Another content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(mockPrompts));

      const prompt = await storage.getById('2');

      expect(prompt).toEqual(mockPrompts[1]);
    });

    it('should return null if prompt not found', async () => {
      mockRoamingSync.get.mockReturnValue(JSON.stringify([]));

      const prompt = await storage.getById('999');

      expect(prompt).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new prompt with generated id and timestamps', async () => {
      mockRoamingSync.get.mockReturnValue(JSON.stringify([]));

      const newPrompt = {
        title: 'New Prompt',
        content: 'New content',
      };

      const created = await storage.create(newPrompt);

      expect(created.id).toBeDefined();
      expect(created.title).toBe('New Prompt');
      expect(created.content).toBe('New content');
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      expect(created.createdAt).toBe(created.updatedAt);
    });

    it('should save prompt to roaming storage', async () => {
      mockRoamingSync.get.mockReturnValue(JSON.stringify([]));

      const newPrompt = {
        title: 'New Prompt',
        content: 'New content',
      };

      await storage.create(newPrompt);

      expect(mockRoamingSync.set).toHaveBeenCalledWith('prompts', expect.any(String));
      expect(mockRoamingSync.saveAsync).toHaveBeenCalled();
    });

    it('should throw error if title already exists', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Existing content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const newPrompt = {
        title: 'Existing Prompt',
        content: 'New content',
      };

      await expect(storage.create(newPrompt)).rejects.toThrow('Prompt with this title already exists');
    });

    it('should perform case-insensitive title uniqueness check', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Existing content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const newPrompt = {
        title: 'existing prompt',
        content: 'New content',
      };

      await expect(storage.create(newPrompt)).rejects.toThrow('Prompt with this title already exists');
    });
  });

  describe('update', () => {
    it('should update existing prompt', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Original Title',
          content: 'Original content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updated = await storage.update('1', updates);

      expect(updated.id).toBe('1');
      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Updated content');
      expect(updated.createdAt).toBe('2026-01-01T00:00:00Z');
      expect(updated.updatedAt).not.toBe('2026-01-01T00:00:00Z');
    });

    it('should throw error if prompt not found', async () => {
      mockRoamingSync.get.mockReturnValue(JSON.stringify([]));

      await expect(storage.update('999', { title: 'New Title' })).rejects.toThrow('Prompt not found');
    });

    it('should throw error if new title conflicts with another prompt', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content 2',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      await expect(storage.update('1', { title: 'Prompt 2' })).rejects.toThrow(
        'Prompt with this title already exists'
      );
    });

    it('should allow updating prompt with same title (case change)', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Original Title',
          content: 'Original content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const updated = await storage.update('1', { title: 'original title' });

      expect(updated.title).toBe('original title');
    });

    it('should save updated prompt to roaming storage', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Original Title',
          content: 'Original content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      await storage.update('1', { title: 'Updated Title' });

      expect(mockRoamingSync.set).toHaveBeenCalledWith('prompts', expect.any(String));
      expect(mockRoamingSync.saveAsync).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing prompt', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content 2',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      await storage.delete('1');

      const deleteCall = mockRoamingSync.set.mock.calls[0];
      const updatedPrompts = JSON.parse(deleteCall[1] as string);

      expect(updatedPrompts).toHaveLength(1);
      expect(updatedPrompts[0].id).toBe('2');
      expect(mockRoamingSync.saveAsync).toHaveBeenCalled();
    });

    it('should throw error if prompt not found', async () => {
      mockRoamingSync.get.mockReturnValue(JSON.stringify([]));

      await expect(storage.delete('999')).rejects.toThrow('Prompt not found');
    });
  });

  describe('isTitleUnique', () => {
    it('should return true if title is unique', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const isUnique = await storage.isTitleUnique('New Prompt');

      expect(isUnique).toBe(true);
    });

    it('should return false if title already exists', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const isUnique = await storage.isTitleUnique('Existing Prompt');

      expect(isUnique).toBe(false);
    });

    it('should perform case-insensitive check', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const isUnique = await storage.isTitleUnique('existing prompt');

      expect(isUnique).toBe(false);
    });

    it('should exclude specified id from uniqueness check', async () => {
      const existingPrompts: Prompt[] = [
        {
          id: '1',
          title: 'Existing Prompt',
          content: 'Content',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockRoamingSync.get.mockReturnValue(JSON.stringify(existingPrompts));

      const isUnique = await storage.isTitleUnique('Existing Prompt', '1');

      expect(isUnique).toBe(true);
    });
  });
});
