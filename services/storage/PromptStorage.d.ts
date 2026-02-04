/**
 * PromptStorage service - CRUD operations for prompts with roaming sync
 * Provides persistent storage of user-created prompts with cross-device synchronization
 */
import { Prompt } from '../../models/Prompt';
/**
 * Service for managing prompt storage with roaming synchronization
 */
export declare class PromptStorage {
    private roamingSync;
    constructor();
    /**
     * Get all prompts sorted alphabetically by title
     * @returns Array of all prompts
     */
    getAll(): Promise<Prompt[]>;
    /**
     * Get a prompt by ID
     * @param id - The prompt ID
     * @returns The prompt, or null if not found
     */
    getById(id: string): Promise<Prompt | null>;
    /**
     * Create a new prompt
     * @param data - Prompt data (title and content)
     * @returns The created prompt with generated ID and timestamps
     * @throws Error if title already exists
     */
    create(data: {
        title: string;
        content: string;
    }): Promise<Prompt>;
    /**
     * Update an existing prompt
     * @param id - The prompt ID
     * @param updates - Fields to update (title and/or content)
     * @returns The updated prompt
     * @throws Error if prompt not found or title conflicts with another prompt
     */
    update(id: string, updates: {
        title?: string;
        content?: string;
    }): Promise<Prompt>;
    /**
     * Delete a prompt
     * @param id - The prompt ID
     * @throws Error if prompt not found
     */
    delete(id: string): Promise<void>;
    /**
     * Check if a title is unique (case-insensitive)
     * @param title - The title to check
     * @param excludeId - Optional prompt ID to exclude from check (for updates)
     * @returns True if title is unique, false otherwise
     */
    isTitleUnique(title: string, excludeId?: string): Promise<boolean>;
    /**
     * Save prompts array to roaming settings
     * @param prompts - Array of prompts to save
     */
    private savePrompts;
}
//# sourceMappingURL=PromptStorage.d.ts.map