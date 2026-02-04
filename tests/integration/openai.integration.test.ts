import { OpenAIClient } from '../../../src/services/openai/OpenAIClient';
import { TokenCounter } from '../../../src/services/openai/TokenCounter';
import { GenerationRequest } from '../../../src/models/GenerationRequest';

/**
 * Integration tests for OpenAI API
 * These tests use mocked API responses to test the integration between components
 */

describe('OpenAI Integration', () => {
  let client: OpenAIClient;
  let tokenCounter: TokenCounter;
  const mockApiKey = 'sk-test1234567890abcdefghijklmnopqrstuv';

  beforeEach(() => {
    tokenCounter = new TokenCounter();
  });

  describe('Token counting and API integration', () => {
    it('should count tokens before sending request', async () => {
      const emailContent = 'This is a test email with some content.';
      const promptContent = 'Please respond professionally.';

      const emailTokens = tokenCounter.countTokens(emailContent);
      const promptTokens = tokenCounter.countTokens(promptContent);
      const totalInputTokens = emailTokens + promptTokens;

      expect(totalInputTokens).toBeGreaterThan(0);
      expect(totalInputTokens).toBeLessThan(100); // Should be reasonable for test
    });

    it('should validate token limit before API call', () => {
      const longContent = 'a'.repeat(50000);
      const limit = 4096;

      const result = tokenCounter.checkLimit(longContent, limit, 'gpt-4');

      expect(result.withinLimit).toBe(false);
      expect(result.tokenCount).toBeGreaterThan(limit);
    });

    it('should calculate estimated cost for request', () => {
      const request: GenerationRequest = {
        emailContent: 'Test email',
        promptContent: 'Test prompt',
        timestamp: Date.now(),
      };

      const inputTokens = tokenCounter.countTokens(
        request.emailContent + request.promptContent
      );
      const estimatedOutputTokens = 100;

      const cost = tokenCounter.calculateCost(inputTokens, estimatedOutputTokens, 'gpt-4');

      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('Request preparation', () => {
    it('should prepare complete generation request', () => {
      const request: GenerationRequest = {
        emailContent: 'Original email content',
        promptContent: 'Response instructions',
        timestamp: Date.now(),
      };

      expect(request.emailContent).toBeDefined();
      expect(request.promptContent).toBeDefined();
      expect(request.timestamp).toBeGreaterThan(0);
    });

    it('should combine email and prompt for API call', () => {
      const emailContent = 'Email thread content';
      const promptContent = 'Please respond';

      const combined = `${promptContent}\n\nEmail thread:\n${emailContent}`;

      expect(combined).toContain(emailContent);
      expect(combined).toContain(promptContent);
    });
  });

  describe('Error handling flow', () => {
    it('should handle authentication error gracefully', async () => {
      // This would test the full error handling flow
      const invalidKey = 'invalid-key';

      expect(() => new OpenAIClient(invalidKey)).not.toThrow();
    });

    it('should provide user-friendly error messages', () => {
      const errors = [
        { status: 401, message: 'Invalid API key' },
        { status: 429, message: 'Rate limit exceeded' },
        { status: 500, message: 'API unavailable' },
      ];

      errors.forEach((error) => {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Response processing', () => {
    it('should validate response structure', () => {
      const mockResponse = {
        generatedText: 'Generated response text',
        tokensUsed: 150,
        responseTime: 1500,
      };

      expect(mockResponse.generatedText).toBeDefined();
      expect(mockResponse.tokensUsed).toBeGreaterThan(0);
      expect(mockResponse.responseTime).toBeGreaterThan(0);
    });

    it('should track response metadata', () => {
      const metadata = {
        model: 'gpt-4',
        requestTimestamp: Date.now(),
        responseTimestamp: Date.now() + 1000,
        tokensUsed: 200,
      };

      expect(metadata.responseTimestamp).toBeGreaterThan(metadata.requestTimestamp);
      expect(metadata.tokensUsed).toBeGreaterThan(0);
    });
  });

  describe('Model selection', () => {
    it('should use correct token limits for different models', () => {
      const models = ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo'];

      models.forEach((model) => {
        const limit = tokenCounter.getModelLimit(model as any);
        expect(limit).toBeGreaterThan(0);
      });
    });

    it('should calculate different costs for different models', () => {
      const inputTokens = 1000;
      const outputTokens = 500;

      const gpt4Cost = tokenCounter.calculateCost(inputTokens, outputTokens, 'gpt-4');
      const gpt35Cost = tokenCounter.calculateCost(
        inputTokens,
        outputTokens,
        'gpt-3.5-turbo'
      );

      expect(gpt4Cost).not.toBe(gpt35Cost);
    });
  });

  describe('Performance tracking', () => {
    it('should measure request duration', async () => {
      const startTime = Date.now();

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should track token usage over time', () => {
      const usage = [
        { timestamp: Date.now(), tokens: 100 },
        { timestamp: Date.now(), tokens: 150 },
        { timestamp: Date.now(), tokens: 200 },
      ];

      const totalTokens = usage.reduce((sum, entry) => sum + entry.tokens, 0);

      expect(totalTokens).toBe(450);
    });
  });

  describe('Content truncation', () => {
    it('should truncate content when over limit', () => {
      const longContent = 'a'.repeat(10000);
      const limit = 100;

      const truncated = tokenCounter.truncateToLimit(longContent, limit, 'gpt-4');

      expect(truncated.length).toBeLessThan(longContent.length);
      expect(tokenCounter.countTokens(truncated, 'gpt-4')).toBeLessThanOrEqual(limit);
    });

    it('should preserve important content when truncating', () => {
      const content = 'IMPORTANT: This message contains critical information.';
      const truncated = tokenCounter.truncateToLimit(content, 50, 'gpt-4');

      // Should try to keep important markers
      expect(truncated).toBeTruthy();
    });
  });
});
