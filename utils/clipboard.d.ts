import type { Prompt } from '../models/Prompt';
/**
 * Clipboard utility functions for import/export functionality
 */
/**
 * Copies text to the system clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when copy is complete
 * @throws Error if clipboard API is not available or copy fails
 */
export declare function copyToClipboard(text: string): Promise<void>;
/**
 * Reads text from the system clipboard
 * @returns Promise that resolves with clipboard text
 * @throws Error if clipboard API is not available or read fails
 */
export declare function readFromClipboard(): Promise<string>;
/**
 * Exports prompts as JSON to clipboard
 * @param prompts - Array of prompts to export
 * @returns Promise that resolves when export is complete
 */
export declare function exportPromptsToClipboard(prompts: Prompt[]): Promise<void>;
/**
 * Imports prompts from clipboard JSON
 * @returns Promise that resolves with parsed prompts
 * @throws Error if clipboard content is not valid JSON
 */
export declare function importPromptsFromClipboard(): Promise<Prompt[]>;
//# sourceMappingURL=clipboard.d.ts.map