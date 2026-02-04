/**
 * Token counter for managing context windows and costs
 * Uses tiktoken for accurate GPT token counting (FR-043)
 */
export declare class TokenCounter {
    private readonly MODEL_LIMITS;
    private readonly MODEL_PRICING;
    /**
     * Count tokens in text using tiktoken
     * @param text Text to count tokens for
     * @param model Model to use for encoding (default: gpt-4)
     * @returns Number of tokens
     */
    countTokens(text: string, model?: string): number;
    /**
     * Estimate tokens using simple heuristic (fallback)
     * @param text Text to estimate tokens for
     * @returns Estimated number of tokens
     */
    estimateTokens(text: string): number;
    /**
     * Check if text is within token limit
     * @param text Text to check
     * @param limit Token limit
     * @param model Model to use for counting
     * @returns Check result with details
     */
    checkLimit(text: string, limit: number, model?: string): {
        withinLimit: boolean;
        tokenCount: number;
        tokensRemaining: number;
    };
    /**
     * Get token limit for model
     * @param model Model name
     * @returns Token limit
     */
    getModelLimit(model: string): number;
    /**
     * Truncate text to fit within token limit
     * @param text Text to truncate
     * @param limit Token limit
     * @param model Model to use for counting
     * @returns Truncated text
     */
    truncateToLimit(text: string, limit: number, model?: string): string;
    /**
     * Calculate cost for token usage
     * @param inputTokens Number of input tokens
     * @param outputTokens Number of output tokens
     * @param model Model used
     * @returns Estimated cost in USD
     */
    calculateCost(inputTokens: number, outputTokens: number, model: string): number;
    /**
     * Get encoding for specific model
     * @param model Model name
     * @returns Tiktoken encoding
     */
    private getEncodingForModel;
}
//# sourceMappingURL=TokenCounter.d.ts.map