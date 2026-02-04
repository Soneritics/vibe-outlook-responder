/**
 * Represents a user-created prompt for AI-powered email response generation.
 * Prompts are synchronized across devices via Office Roaming Settings.
 */
export interface Prompt {
  /**
   * Unique identifier for the prompt (UUID v4 format)
   */
  id: string;

  /**
   * Display title for the prompt (max 100 characters)
   * Must be unique across all prompts
   */
  title: string;

  /**
   * The actual prompt content sent to ChatGPT (max 10,000 characters)
   */
  content: string;

  /**
   * ISO 8601 timestamp when the prompt was created
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp when the prompt was last modified
   */
  updatedAt: string;
}
