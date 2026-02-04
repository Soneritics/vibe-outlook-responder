import OpenAI from 'openai';
import { GenerationRequest } from '../../models/GenerationRequest';
import { GenerationResponse } from '../../models/GenerationResponse';

/**
 * OpenAI API client for generating email responses
 * Implements direct API calls without system prompt wrapping (FR-024)
 * No timeout on requests (FR-029c)
 */
export class OpenAIClient {
  private client: OpenAI;
  private abortController: AbortController | null = null;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for browser environment
    });
  }

  /**
   * Generate AI response for email
   * @param request Generation request with email content and prompt
   * @param model Model to use for generation
   * @returns Generated response with metadata
   */
  async generateResponse(
    request: GenerationRequest,
    model: string
  ): Promise<GenerationResponse> {
    const startTime = Date.now();

    try {
      // Create abort controller for cancellation support
      this.abortController = new AbortController();

      // Combine prompt and email content without system prompt wrapping (FR-024)
      const userMessage = `${request.promptContent}\n\nEmail thread:\n${request.emailContent}`;

      // Make direct API call without timeout (FR-029c)
      const completion = await this.client.chat.completions.create(
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: 0.7,
        },
        {
          signal: this.abortController.signal,
        }
      );

      const responseTime = Date.now() - startTime;

      // Extract generated text
      const generatedText = completion.choices[0]?.message?.content || '';

      if (!generatedText) {
        throw new Error('No response generated from API');
      }

      return {
        generatedText,
        tokensUsed: completion.usage?.total_tokens || 0,
        responseTime,
      };
    } catch (error: any) {
      // Handle cancellation
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        throw new Error('Request cancelled');
      }

      // Handle specific API errors
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your settings.');
      }

      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }

      if (error.status === 400) {
        // Content policy violation or bad request
        throw new Error(error.message || 'Content policy violation');
      }

      if (error.status >= 500) {
        throw new Error('OpenAI API is temporarily unavailable. Please try again later.');
      }

      // Re-throw other errors
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Test API key connection
   * @returns True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      // Make a minimal API call to test the key
      await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });

      return true;
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid API key');
      }
      throw error;
    }
  }

  /**
   * Cancel current generation request
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
