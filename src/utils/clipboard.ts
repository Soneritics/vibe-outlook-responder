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
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard !== undefined && navigator.clipboard.writeText !== undefined) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (error) {
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Reads text from the system clipboard
 * @returns Promise that resolves with clipboard text
 * @throws Error if clipboard API is not available or read fails
 */
export async function readFromClipboard(): Promise<string> {
  try {
    if (navigator.clipboard !== undefined && navigator.clipboard.readText !== undefined) {
      return await navigator.clipboard.readText();
    } else {
      throw new Error('Clipboard API not available in this browser');
    }
  } catch (error) {
    throw new Error('Failed to read from clipboard');
  }
}

/**
 * Exports prompts as JSON to clipboard
 * @param prompts - Array of prompts to export
 * @returns Promise that resolves when export is complete
 */
export async function exportPromptsToClipboard(
  prompts: Prompt[]
): Promise<void> {
  const json = JSON.stringify(prompts, null, 2);
  return await copyToClipboard(json);
}

/**
 * Imports prompts from clipboard JSON
 * @returns Promise that resolves with parsed prompts
 * @throws Error if clipboard content is not valid JSON
 */
export async function importPromptsFromClipboard(): Promise<Prompt[]> {
  const json = await readFromClipboard();
  try {
    const prompts = JSON.parse(json) as Prompt[];
    if (!Array.isArray(prompts)) {
      throw new Error('Invalid format: expected array of prompts');
    }
    return prompts;
  } catch (error) {
    throw new Error('Failed to parse clipboard content as JSON');
  }
}
