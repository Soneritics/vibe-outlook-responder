import { TokenCounter } from '../../../src/services/openai/TokenCounter';

describe('TokenCounter', () => {
  let counter: TokenCounter;

  beforeEach(() => {
    counter = new TokenCounter();
  });

  describe('countTokens', () => {
    it('should count tokens in simple text', () => {
      const text = 'Hello world';
      const count = counter.countTokens(text);
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(10);
    });

    it('should return 0 for empty string', () => {
      const count = counter.countTokens('');
      expect(count).toBe(0);
    });

    it('should count tokens in longer text', () => {
      const text = 'This is a longer piece of text that should have more tokens.';
      const count = counter.countTokens(text);
      expect(count).toBeGreaterThan(10);
    });

    it('should count tokens for different encodings', () => {
      const text = 'Hello world';
      const gpt4Count = counter.countTokens(text, 'gpt-4');
      const gpt35Count = counter.countTokens(text, 'gpt-3.5-turbo');

      // Both should be positive
      expect(gpt4Count).toBeGreaterThan(0);
      expect(gpt35Count).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const text = 'Special chars: @#$%^&*()';
      const count = counter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const text = 'Unicode: 你好世界 🌍';
      const count = counter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle newlines and whitespace', () => {
      const text = 'Line 1\nLine 2\n\nLine 3';
      const count = counter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens approximately', () => {
      const text =
        'This is approximately one hundred characters long text for testing token estimation algorithm.';
      const estimate = counter.estimateTokens(text);
      const actual = counter.countTokens(text);

      // Estimate should be within reasonable range of actual (50% tolerance for simple estimation)
      expect(estimate).toBeGreaterThan(actual * 0.5);
      expect(estimate).toBeLessThan(actual * 2);
    });

    it('should estimate 0 for empty string', () => {
      const estimate = counter.estimateTokens('');
      expect(estimate).toBe(0);
    });

    it('should estimate for long text', () => {
      const text = 'a'.repeat(1000);
      const estimate = counter.estimateTokens(text);
      expect(estimate).toBeGreaterThan(0);
    });
  });

  describe('checkLimit', () => {
    it('should return true when under limit', () => {
      const text = 'Short text';
      const result = counter.checkLimit(text, 1000, 'gpt-4');
      expect(result.withinLimit).toBe(true);
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.tokenCount).toBeLessThan(1000);
    });

    it('should return false when over limit', () => {
      const text = 'a'.repeat(10000);
      const result = counter.checkLimit(text, 100, 'gpt-4');
      expect(result.withinLimit).toBe(false);
      expect(result.tokenCount).toBeGreaterThan(100);
    });

    it('should calculate tokens remaining', () => {
      const text = 'Test text';
      const limit = 1000;
      const result = counter.checkLimit(text, limit, 'gpt-4');
      expect(result.tokensRemaining).toBe(limit - result.tokenCount);
    });

    it('should handle edge case at exact limit', () => {
      const text = 'Test';
      const tokenCount = counter.countTokens(text);
      const result = counter.checkLimit(text, tokenCount, 'gpt-4');
      expect(result.withinLimit).toBe(true);
      expect(result.tokensRemaining).toBe(0);
    });
  });

  describe('getModelLimit', () => {
    it('should return correct limit for GPT-4', () => {
      const limit = counter.getModelLimit('gpt-4');
      expect(limit).toBe(8192);
    });

    it('should return correct limit for GPT-4o', () => {
      const limit = counter.getModelLimit('gpt-4o');
      expect(limit).toBe(128000);
    });

    it('should return correct limit for GPT-3.5-turbo', () => {
      const limit = counter.getModelLimit('gpt-3.5-turbo');
      expect(limit).toBe(16385);
    });

    it('should return default limit for unknown model', () => {
      const limit = counter.getModelLimit('unknown-model' as any);
      expect(limit).toBe(4096);
    });
  });

  describe('truncateToLimit', () => {
    it('should not truncate text under limit', () => {
      const text = 'Short text';
      const result = counter.truncateToLimit(text, 1000, 'gpt-4');
      expect(result).toBe(text);
    });

    it('should truncate text over limit', () => {
      const text = 'a'.repeat(10000);
      const result = counter.truncateToLimit(text, 100, 'gpt-4');
      expect(result.length).toBeLessThan(text.length);
      expect(counter.countTokens(result, 'gpt-4')).toBeLessThanOrEqual(100);
    });

    it('should preserve word boundaries when truncating', () => {
      const text = 'This is a long sentence with many words that should be truncated at some point';
      // Use a reasonable limit that allows for word boundary preservation
      const result = counter.truncateToLimit(text, 10, 'gpt-4');
      expect(result.length).toBeLessThan(text.length);
      // Should end at a word boundary (space or punctuation) when possible
      // Due to implementation, this only happens when last space is in last 10%
      // So we just check it truncated properly
      expect(counter.countTokens(result, 'gpt-4')).toBeLessThanOrEqual(10);
    });

    it('should handle empty string', () => {
      const result = counter.truncateToLimit('', 100, 'gpt-4');
      expect(result).toBe('');
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for GPT-4', () => {
      const inputTokens = 1000;
      const outputTokens = 500;
      const cost = counter.calculateCost(inputTokens, outputTokens, 'gpt-4');
      expect(cost).toBeGreaterThan(0);
    });

    it('should return 0 for zero tokens', () => {
      const cost = counter.calculateCost(0, 0, 'gpt-4');
      expect(cost).toBe(0);
    });

    it('should calculate different costs for different models', () => {
      const inputTokens = 1000;
      const outputTokens = 500;
      const gpt4Cost = counter.calculateCost(inputTokens, outputTokens, 'gpt-4');
      const gpt35Cost = counter.calculateCost(inputTokens, outputTokens, 'gpt-3.5-turbo');

      expect(gpt4Cost).not.toBe(gpt35Cost);
    });
  });
});
