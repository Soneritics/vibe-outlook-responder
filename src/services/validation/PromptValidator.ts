import { PROMPT_ERRORS } from '../../utils/errorMessages';
import type { Prompt } from '../../models/Prompt';

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
 * Maximum length for prompt title
 */
const MAX_TITLE_LENGTH = 100;

/**
 * Maximum length for prompt content
 */
const MAX_CONTENT_LENGTH = 10000;

/**
 * Validates prompt title
 * @param title - The prompt title to validate
 * @returns Validation result with error message if invalid
 */
export function validatePromptTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      error: PROMPT_ERRORS.TITLE_REQUIRED,
    };
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      error: PROMPT_ERRORS.TITLE_TOO_LONG,
    };
  }

  return { isValid: true };
}

/**
 * Validates prompt content
 * @param content - The prompt content to validate
 * @returns Validation result with error message if invalid
 */
export function validatePromptContent(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: PROMPT_ERRORS.CONTENT_REQUIRED,
    };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      isValid: false,
      error: PROMPT_ERRORS.CONTENT_TOO_LONG,
    };
  }

  return { isValid: true };
}

/**
 * Checks if a title is unique among existing prompts
 * @param title - The title to check
 * @param existingPrompts - Array of existing prompts
 * @param currentPromptId - Optional ID of prompt being edited
 * @returns Validation result with error if duplicate found
 */
export function validatePromptUniqueness(
  title: string,
  existingPrompts: Prompt[],
  currentPromptId?: string
): ValidationResult {
  const normalizedTitle = title.trim().toLowerCase();

  const duplicate = existingPrompts.find((prompt) => {
    // Skip the current prompt when editing
    if (currentPromptId !== undefined && prompt.id === currentPromptId) {
      return false;
    }
    return prompt.title.trim().toLowerCase() === normalizedTitle;
  });

  if (duplicate !== undefined) {
    return {
      isValid: false,
      error: PROMPT_ERRORS.TITLE_DUPLICATE,
    };
  }

  return { isValid: true };
}

/**
 * Validates a complete prompt object
 * @param prompt - The prompt to validate
 * @param existingPrompts - Array of existing prompts
 * @returns Validation result with first error encountered
 */
export function validatePrompt(
  prompt: { title: string; content: string; id?: string },
  existingPrompts: Prompt[]
): ValidationResult {
  const titleValidation = validatePromptTitle(prompt.title);
  if (!titleValidation.isValid) {
    return titleValidation;
  }

  const contentValidation = validatePromptContent(prompt.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  const uniquenessValidation = validatePromptUniqueness(
    prompt.title,
    existingPrompts,
    prompt.id
  );
  if (!uniquenessValidation.isValid) {
    return uniquenessValidation;
  }

  return { isValid: true };
}
