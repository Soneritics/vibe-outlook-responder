/**
 * PromptStorage service - CRUD operations for prompts with roaming sync
 * Provides persistent storage of user-created prompts with cross-device synchronization
 */

import { Prompt } from '../../models/Prompt';
import { RoamingSync } from './RoamingSync';
import { v4 as uuidv4 } from 'uuid';

const PROMPTS_KEY = 'prompts';

/**
 * Service for managing prompt storage with roaming synchronization
 */
export class PromptStorage {
  private roamingSync: RoamingSync;

  constructor() {
    this.roamingSync = new RoamingSync();
  }

  /**
   * Get all prompts sorted alphabetically by title
   * @returns Array of all prompts
   */
  async getAll(): Promise<Prompt[]> {
    try {
      const data = this.roamingSync.get(PROMPTS_KEY);
      if (!data) {
        return [];
      }

      const prompts: Prompt[] = JSON.parse(data);
      // Sort alphabetically by title (case-insensitive)
      return prompts.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    } catch (error) {
      console.error('Failed to parse prompts from storage:', error);
      return [];
    }
  }

  /**
   * Get a prompt by ID
   * @param id - The prompt ID
   * @returns The prompt, or null if not found
   */
  async getById(id: string): Promise<Prompt | null> {
    const prompts = await this.getAll();
    return prompts.find((p) => p.id === id) || null;
  }

  /**
   * Create a new prompt
   * @param data - Prompt data (title and content)
   * @returns The created prompt with generated ID and timestamps
   * @throws Error if title already exists
   */
  async create(data: { title: string; content: string }): Promise<Prompt> {
    const prompts = await this.getAll();

    // Check for duplicate title (case-insensitive)
    const titleExists = prompts.some(
      (p) => p.title.toLowerCase() === data.title.toLowerCase()
    );

    if (titleExists) {
      throw new Error('Prompt with this title already exists');
    }

    // Create new prompt with generated ID and timestamps
    const now = new Date().toISOString();
    const newPrompt: Prompt = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    };

    // Add to prompts array
    prompts.push(newPrompt);

    // Save to roaming settings
    await this.savePrompts(prompts);

    return newPrompt;
  }

  /**
   * Update an existing prompt
   * @param id - The prompt ID
   * @param updates - Fields to update (title and/or content)
   * @returns The updated prompt
   * @throws Error if prompt not found or title conflicts with another prompt
   */
  async update(id: string, updates: { title?: string; content?: string }): Promise<Prompt> {
    const prompts = await this.getAll();
    const index = prompts.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Prompt not found');
    }

    const prompt = prompts[index]!; // Non-null assertion since we checked index !== -1

    // If title is being updated, check for conflicts with other prompts
    if (updates.title !== undefined && updates.title.toLowerCase() !== prompt.title.toLowerCase()) {
      const titleExists = prompts.some(
        (p) => p.id !== id && p.title.toLowerCase() === updates.title!.toLowerCase()
      );

      if (titleExists) {
        throw new Error('Prompt with this title already exists');
      }
    }

    // Update prompt fields
    const updatedPrompt: Prompt = {
      id: prompt.id,
      title: updates.title !== undefined ? updates.title : prompt.title,
      content: updates.content !== undefined ? updates.content : prompt.content,
      createdAt: prompt.createdAt,
      updatedAt: new Date().toISOString(),
    };

    prompts[index] = updatedPrompt;

    // Save to roaming settings
    await this.savePrompts(prompts);

    return updatedPrompt;
  }

  /**
   * Delete a prompt
   * @param id - The prompt ID
   * @throws Error if prompt not found
   */
  async delete(id: string): Promise<void> {
    const prompts = await this.getAll();
    const index = prompts.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Prompt not found');
    }

    // Remove prompt from array
    prompts.splice(index, 1);

    // Save to roaming settings
    await this.savePrompts(prompts);
  }

  /**
   * Check if a title is unique (case-insensitive)
   * @param title - The title to check
   * @param excludeId - Optional prompt ID to exclude from check (for updates)
   * @returns True if title is unique, false otherwise
   */
  async isTitleUnique(title: string, excludeId?: string): Promise<boolean> {
    const prompts = await this.getAll();
    return !prompts.some(
      (p) => p.id !== excludeId && p.title.toLowerCase() === title.toLowerCase()
    );
  }

  /**
   * Save prompts array to roaming settings
   * @param prompts - Array of prompts to save
   */
  private async savePrompts(prompts: Prompt[]): Promise<void> {
    this.roamingSync.set(PROMPTS_KEY, JSON.stringify(prompts));
    await this.roamingSync.saveAsync();
  }
}
