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
 * Validates prompt title
 * @param title - The prompt title to validate
 * @returns Validation result with error message if invalid
 */
export declare function validatePromptTitle(title: string): ValidationResult;
/**
 * Validates prompt content
 * @param content - The prompt content to validate
 * @returns Validation result with error message if invalid
 */
export declare function validatePromptContent(content: string): ValidationResult;
/**
 * Checks if a title is unique among existing prompts
 * @param title - The title to check
 * @param existingPrompts - Array of existing prompts
 * @param currentPromptId - Optional ID of prompt being edited
 * @returns Validation result with error if duplicate found
 */
export declare function validatePromptUniqueness(title: string, existingPrompts: Prompt[], currentPromptId?: string): ValidationResult;
/**
 * Validates a complete prompt object
 * @param prompt - The prompt to validate
 * @param existingPrompts - Array of existing prompts
 * @returns Validation result with first error encountered
 */
export declare function validatePrompt(prompt: {
    title: string;
    content: string;
    id?: string;
}, existingPrompts: Prompt[]): ValidationResult;
//# sourceMappingURL=PromptValidator.d.ts.map