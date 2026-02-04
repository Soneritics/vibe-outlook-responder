import { encoding_for_model, get_encoding, TiktokenModel } from 'tiktoken';

/**
 * Token counter for managing context windows and costs
 * Uses tiktoken for accurate GPT token counting (FR-043)
 */
export class TokenCounter {
  // Model token limits
  private readonly MODEL_LIMITS: Record<string, number> = {
    'gpt-4': 8192,
    'gpt-4o': 128000,
    'gpt-4-turbo': 128000,
    'gpt-3.5-turbo': 16385,
  };

  // Pricing per 1K tokens (input/output)
  private readonly MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  };

  /**
   * Count tokens in text using tiktoken
   * @param text Text to count tokens for
   * @param model Model to use for encoding (default: gpt-4)
   * @returns Number of tokens
   */
  countTokens(text: string, model: string = 'gpt-4'): number {
    if (!text || text.trim() === '') {
      return 0;
    }

    try {
      // Get encoding for model
      const encoding = this.getEncodingForModel(model);
      const tokens = encoding.encode(text);
      encoding.free(); // Free memory
      return tokens.length;
    } catch (error) {
      // Fallback to estimation if tiktoken fails
      return this.estimateTokens(text);
    }
  }

  /**
   * Estimate tokens using simple heuristic (fallback)
   * @param text Text to estimate tokens for
   * @returns Estimated number of tokens
   */
  estimateTokens(text: string): number {
    if (!text || text.trim() === '') {
      return 0;
    }

    // Rough estimate: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if text is within token limit
   * @param text Text to check
   * @param limit Token limit
   * @param model Model to use for counting
   * @returns Check result with details
   */
  checkLimit(
    text: string,
    limit: number,
    model: string = 'gpt-4'
  ): {
    withinLimit: boolean;
    tokenCount: number;
    tokensRemaining: number;
  } {
    const tokenCount = this.countTokens(text, model);
    const withinLimit = tokenCount <= limit;
    const tokensRemaining = limit - tokenCount;

    return {
      withinLimit,
      tokenCount,
      tokensRemaining,
    };
  }

  /**
   * Get token limit for model
   * @param model Model name
   * @returns Token limit
   */
  getModelLimit(model: string): number {
    return this.MODEL_LIMITS[model] || 4096; // Default to base GPT-4 limit
  }

  /**
   * Truncate text to fit within token limit
   * @param text Text to truncate
   * @param limit Token limit
   * @param model Model to use for counting
   * @returns Truncated text
   */
  truncateToLimit(text: string, limit: number, model: string = 'gpt-4'): string {
    if (!text) {
      return '';
    }

    const currentTokens = this.countTokens(text, model);

    if (currentTokens <= limit) {
      return text;
    }

    // Binary search to find truncation point
    let left = 0;
    let right = text.length;
    let result = '';

    while (left < right) {
      const mid = Math.floor((left + right + 1) / 2);
      const truncated = text.substring(0, mid);
      const tokens = this.countTokens(truncated, model);

      if (tokens <= limit) {
        result = truncated;
        left = mid;
      } else {
        right = mid - 1;
      }
    }

    // Try to end at a word boundary
    const lastSpace = result.lastIndexOf(' ');
    if (lastSpace > result.length * 0.9) {
      // Only trim if we're close to the end
      result = result.substring(0, lastSpace);
    }

    return result;
  }

  /**
   * Calculate cost for token usage
   * @param inputTokens Number of input tokens
   * @param outputTokens Number of output tokens
   * @param model Model used
   * @returns Estimated cost in USD
   */
  calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing = this.MODEL_PRICING[model];

    if (!pricing) {
      return 0;
    }

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get encoding for specific model
   * @param model Model name
   * @returns Tiktoken encoding
   */
  private getEncodingForModel(model: string) {
    try {
      // Try to get model-specific encoding
      return encoding_for_model(model as TiktokenModel);
    } catch {
      // Fallback to cl100k_base (used by GPT-4 and GPT-3.5-turbo)
      return get_encoding('cl100k_base');
    }
  }
}
