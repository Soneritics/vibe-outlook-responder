/**
 * Represents the response from ChatGPT API after generating email content.
 * This is a transient object used for handling the generation result.
 */
export interface GenerationResponse {
  /**
   * The AI-generated email response text
   * Formatted as HTML to preserve formatting
   */
  generatedText: string;

  /**
   * Number of tokens consumed by the request
   * Includes both input (prompt + email) and output (response)
   */
  tokensUsed: number;

  /**
   * Time taken to generate the response (in milliseconds)
   * Measured from request sent to response received
   */
  responseTime: number;

  /**
   * ISO 8601 timestamp when the response was received
   */
  timestamp: string;

  /**
   * Whether content summarization occurred due to token limits
   * If true, user should be notified that older messages were summarized
   */
  wasSummarized: boolean;
}
