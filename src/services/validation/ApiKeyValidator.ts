import { API_KEY_ERRORS } from '../../utils/errorMessages';

/**
 * Validation result structure
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  isValid: boolean;

  /**
   * Error message if validation failed
   */
  error?: string;
}

/**
 * Minimum length for a valid OpenAI API key
 */
const MIN_LENGTH = 20;

/**
 * Required prefix for OpenAI API keys
 */
const REQUIRED_PREFIX = 'sk-';

/**
 * Validates API key format
 * @param apiKey - The API key to validate
 * @returns Validation result with error message if invalid
 */
export function validateApiKeyFormat(apiKey: string): ValidationResult {
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      isValid: false,
      error: API_KEY_ERRORS.REQUIRED,
    };
  }

  if (!apiKey.startsWith(REQUIRED_PREFIX)) {
    return {
      isValid: false,
      error: API_KEY_ERRORS.INVALID_FORMAT,
    };
  }

  if (apiKey.length < MIN_LENGTH) {
    return {
      isValid: false,
      error: API_KEY_ERRORS.INVALID_FORMAT,
    };
  }

  return { isValid: true };
}

/**
 * Masks an API key for secure display
 * Shows first 7 chars and last 4 chars, masks the rest
 * Example: sk-proj****...****xyz9
 * @param apiKey - The API key to mask
 * @returns Masked API key string
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '****';
  }

  const visibleStart = apiKey.substring(0, 7);
  const visibleEnd = apiKey.substring(apiKey.length - 4);
  return `${visibleStart}****...****${visibleEnd}`;
}
