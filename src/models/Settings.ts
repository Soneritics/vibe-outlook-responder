/**
 * User configuration settings for the add-in.
 * API key is stored locally for security; other settings sync via Roaming Settings.
 */
export interface Settings {
  /**
   * OpenAI API key (format: sk-*)
   * Stored in localStorage (local only, not synced)
   */
  apiKey: string;

  /**
   * Selected ChatGPT model for AI generation
   * Options: 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
   * Default: 'gpt-4o'
   * Synced via Roaming Settings
   */
  selectedModel: 'gpt-4o' | 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo';

  /**
   * Configurable keyboard shortcuts for quick actions
   * Synced via Roaming Settings
   */
  keyboardShortcuts: {
    /**
     * Shortcut to open prompt dropdown in compose mode
     * Format: "Ctrl+Shift+P" or "Cmd+Shift+P"
     */
    openPromptDropdown?: string;
  };

  /**
   * ISO 8601 timestamp when settings were last updated
   */
  lastUpdated: string;
}
