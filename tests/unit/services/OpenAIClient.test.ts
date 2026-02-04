import { OpenAIClient } from '../../../src/services/openai/OpenAIClient';
import { GenerationRequest } from '../../../src/models/GenerationRequest';

// Mock the OpenAI SDK
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

describe('OpenAIClient', () => {
  let client: OpenAIClient;
  const mockApiKey = 'sk-test1234567890abcdefghijklmnopqrstuv';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid API key', () => {
      expect(() => new OpenAIClient(mockApiKey)).not.toThrow();
    });

    it('should throw error with empty API key', () => {
      expect(() => new OpenAIClient('')).toThrow('API key is required');
    });
  });

  describe('generateResponse', () => {
    beforeEach(() => {
      client = new OpenAIClient(mockApiKey);
    });

    it('should generate response with valid request', async () => {
      const request: GenerationRequest = {
        emailContent: 'Original email content',
        promptContent: 'Please respond professionally',
        timestamp: Date.now(),
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated response text',
            },
          },
        ],
        usage: {
          total_tokens: 150,
        },
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockResolvedValue(mockResponse);

      const response = await client.generateResponse(request, 'gpt-4');

      expect(response).toBeDefined();
      expect(response.generatedText).toBe('Generated response text');
      expect(response.tokensUsed).toBe(150);
      expect(response.responseTime).toBeGreaterThan(0);
    });

    it('should use specified model', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test content',
        promptContent: 'Test prompt',
        timestamp: Date.now(),
      };

      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockResolvedValue(mockResponse);

      await client.generateResponse(request, 'gpt-4o');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
        })
      );
    });

    it('should not wrap prompt with system message', async () => {
      const request: GenerationRequest = {
        emailContent: 'Email content',
        promptContent: 'User prompt',
        timestamp: Date.now(),
      };

      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockResolvedValue(mockResponse);

      await client.generateResponse(request, 'gpt-4');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(1);
      expect(callArgs.messages[0].role).toBe('user');
    });

    it('should handle API errors gracefully', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(client.generateResponse(request, 'gpt-4')).rejects.toThrow('API Error');
    });

    it('should handle authentication errors', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const authError = new Error('Invalid API key');
      (authError as any).status = 401;

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockRejectedValue(authError);

      await expect(client.generateResponse(request, 'gpt-4')).rejects.toThrow('Invalid API key');
    });

    it('should handle rate limit errors', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(client.generateResponse(request, 'gpt-4')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle content policy violations', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const policyError = new Error('Content policy violation');
      (policyError as any).status = 400;

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockRejectedValue(policyError);

      await expect(client.generateResponse(request, 'gpt-4')).rejects.toThrow(
        'Content policy violation'
      );
    });

    it('should not timeout waiting for response', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;

      // Simulate long response time
      mockCreate.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 10000);
          })
      );

      // This should not throw a timeout error
      const responsePromise = client.generateResponse(request, 'gpt-4');
      expect(responsePromise).resolves.toBeDefined();
    }, 15000); // Increase test timeout to accommodate delay
  });

  describe('testConnection', () => {
    beforeEach(() => {
      client = new OpenAIClient(mockApiKey);
    });

    it('should successfully test valid API key', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
        usage: { total_tokens: 10 },
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockResolvedValue(mockResponse);

      await expect(client.testConnection()).resolves.toBe(true);
    });

    it('should fail with invalid API key', async () => {
      const authError = new Error('Invalid API key');
      (authError as any).status = 401;

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockRejectedValue(authError);

      await expect(client.testConnection()).rejects.toThrow('Invalid API key');
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      client = new OpenAIClient(mockApiKey);
    });

    it('should cancel in-progress request', async () => {
      const request: GenerationRequest = {
        emailContent: 'Test',
        promptContent: 'Test',
        timestamp: Date.now(),
      };

      const openai = require('openai');
      const mockCreate = openai.OpenAI.mock.results[0].value.chat.completions.create;
      mockCreate.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ choices: [], usage: { total_tokens: 0 } }), 5000);
          })
      );

      const responsePromise = client.generateResponse(request, 'gpt-4');
      client.cancel();

      await expect(responsePromise).rejects.toThrow('Request cancelled');
    });
  });
});
