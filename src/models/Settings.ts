/**
 * Supported ChatGPT models for AI generation
 */
export type SupportedModel =
  | 'gpt-5.2'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo';

/**
 * User configuration settings for the add-in.
 * API key is stored encrypted in Roaming Settings; other settings also sync via Roaming Settings.
 */
export interface Settings {
  /**
   * OpenAI API key (format: sk-*)
   * Stored encrypted in Roaming Settings
   */
  apiKey: string;

  /**
   * Selected ChatGPT model for AI generation
   * Options: 'gpt-5.2', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
   * Default: 'gpt-5.2'
   * Synced via Roaming Settings
   */
  selectedModel: SupportedModel;

  /**
   * ISO 8601 timestamp when settings were last updated
   */
  lastUpdated: string;
}
