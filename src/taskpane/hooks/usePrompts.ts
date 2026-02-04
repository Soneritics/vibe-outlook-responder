/**
 * usePrompts hook - React hook for managing prompts
 * Provides CRUD operations and loading states for prompt management
 */

import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '../../models/Prompt';
import { PromptStorage } from '../../services/storage/PromptStorage';

interface UsePromptsReturn {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  getPrompt: (id: string) => Promise<Prompt | null>;
  createPrompt: (data: { title: string; content: string }) => Promise<Prompt>;
  updatePrompt: (id: string, updates: { title?: string; content?: string }) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  isTitleUnique: (title: string, excludeId?: string) => Promise<boolean>;
  refreshPrompts: () => Promise<void>;
}

/**
 * Custom hook for managing prompts with CRUD operations
 * @returns Object with prompts, loading state, error state, and CRUD functions
 */
export function usePrompts(): UsePromptsReturn {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storage] = useState(() => new PromptStorage());

  /**
   * Load all prompts from storage
   */
  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allPrompts = await storage.getAll();
      setPrompts(allPrompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prompts';
      setError(errorMessage);
      console.error('Failed to load prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  /**
   * Load prompts on mount
   */
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  /**
   * Get a single prompt by ID
   */
  const getPrompt = useCallback(
    async (id: string): Promise<Prompt | null> => {
      try {
        return await storage.getById(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get prompt';
        setError(errorMessage);
        console.error('Failed to get prompt:', err);
        return null;
      }
    },
    [storage]
  );

  /**
   * Create a new prompt
   */
  const createPrompt = useCallback(
    async (data: { title: string; content: string }): Promise<Prompt> => {
      try {
        setError(null);
        const newPrompt = await storage.create(data);
        // Refresh prompts list
        await loadPrompts();
        return newPrompt;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
        setError(errorMessage);
        throw err;
      }
    },
    [storage, loadPrompts]
  );

  /**
   * Update an existing prompt
   */
  const updatePrompt = useCallback(
    async (id: string, updates: { title?: string; content?: string }): Promise<Prompt> => {
      try {
        setError(null);
        const updatedPrompt = await storage.update(id, updates);
        // Refresh prompts list
        await loadPrompts();
        return updatedPrompt;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
        setError(errorMessage);
        throw err;
      }
    },
    [storage, loadPrompts]
  );

  /**
   * Delete a prompt
   */
  const deletePrompt = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        await storage.delete(id);
        // Refresh prompts list
        await loadPrompts();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
        setError(errorMessage);
        throw err;
      }
    },
    [storage, loadPrompts]
  );

  /**
   * Check if a title is unique
   */
  const isTitleUnique = useCallback(
    async (title: string, excludeId?: string): Promise<boolean> => {
      try {
        return await storage.isTitleUnique(title, excludeId);
      } catch (err) {
        console.error('Failed to check title uniqueness:', err);
        return false;
      }
    },
    [storage]
  );

  /**
   * Refresh prompts list manually
   */
  const refreshPrompts = useCallback(async () => {
    await loadPrompts();
  }, [loadPrompts]);

  return {
    prompts,
    loading,
    error,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    isTitleUnique,
    refreshPrompts,
  };
}
