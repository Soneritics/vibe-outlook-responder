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
 * Validates API key format
 * @param apiKey - The API key to validate
 * @returns Validation result with error message if invalid
 */
export declare function validateApiKeyFormat(apiKey: string): ValidationResult;
/**
 * Masks an API key for secure display
 * Shows first 7 chars and last 4 chars, masks the rest
 * Example: sk-proj****...****xyz9
 * @param apiKey - The API key to mask
 * @returns Masked API key string
 */
export declare function maskApiKey(apiKey: string): string;
//# sourceMappingURL=ApiKeyValidator.d.ts.map