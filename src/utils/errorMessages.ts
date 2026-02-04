/**
 * Centralized error message constants for consistent UX
 * All user-facing error messages are defined here for easy localization
 */

/**
 * API Key validation errors
 */
export const API_KEY_ERRORS = {
  REQUIRED: 'API key is required',
  INVALID_FORMAT: 'API key must start with "sk-" and be at least 20 characters',
  CONNECTION_FAILED: 'Failed to connect to OpenAI. Please check your API key.',
} as const;

/**
 * Prompt validation errors
 */
export const PROMPT_ERRORS = {
  TITLE_REQUIRED: 'Prompt title is required',
  TITLE_TOO_LONG: 'Prompt title must be 100 characters or less',
  TITLE_DUPLICATE: 'A prompt with this title already exists',
  CONTENT_REQUIRED: 'Prompt content is required',
  CONTENT_TOO_LONG: 'Prompt content must be 10,000 characters or less',
} as const;

/**
 * Generation errors
 */
export const GENERATION_ERRORS = {
  NO_API_KEY: 'Please configure your API key in Settings before generating responses',
  NO_EMAIL_CONTENT: 'No email content found to generate a response',
  INVALID_API_KEY: 'Invalid or expired API key. Please check your settings.',
  API_UNAVAILABLE: 'ChatGPT service is temporarily unavailable. Please try again later.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
  CONTENT_POLICY: 'Content violates OpenAI content policy',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  CANCELLED: 'Generation cancelled by user',
} as const;

/**
 * Storage errors
 */
export const STORAGE_ERRORS = {
  SAVE_FAILED: 'Failed to save data. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh and try again.',
  QUOTA_EXCEEDED: 'Storage quota exceeded. Please delete some prompts.',
} as const;

/**
 * Import/Export errors
 */
export const IMPORT_EXPORT_ERRORS = {
  EXPORT_FAILED: 'Failed to export prompts. Please try again.',
  IMPORT_FAILED: 'Failed to import prompts. Please check the clipboard content.',
  INVALID_JSON: 'Clipboard content is not valid JSON',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully',
  DELETED: 'Deleted successfully',
  EXPORTED: 'Prompts exported to clipboard',
  IMPORTED: 'Prompts imported successfully',
  CONNECTION_SUCCESS: 'API key verified successfully',
  RESET_COMPLETE: 'All data has been reset',
} as const;

/**
 * Confirmation messages
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_PROMPT: 'Are you sure you want to delete this prompt?',
  RESET_ALL_DATA: 'This will delete all prompts and settings. Continue?',
} as const;
