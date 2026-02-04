/**
 * Represents a request to generate an AI-powered email response.
 * This is a transient object used for orchestrating the generation flow.
 */
export interface GenerationRequest {
  /**
   * The email thread content to provide as context to ChatGPT
   * Includes original message, reply chain, and metadata
   * May be summarized if token limit is exceeded
   */
  emailContent: string;

  /**
   * The user-selected prompt content to send to ChatGPT
   * Used without system prompt wrapping (user has full control)
   */
  promptContent: string;

  /**
   * ISO 8601 timestamp when the generation request was initiated
   */
  timestamp: string;

  /**
   * Selected ChatGPT model for this request
   */
  model: 'gpt-5' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
}
