import { GenerationRequest } from '../../models/GenerationRequest';
import { GenerationResponse } from '../../models/GenerationResponse';
/**
 * OpenAI API client for generating email responses
 * Implements direct API calls without system prompt wrapping (FR-024)
 * No timeout on requests (FR-029c)
 */
export declare class OpenAIClient {
    private client;
    private abortController;
    constructor(apiKey: string);
    /**
     * Generate AI response for email
     * @param request Generation request with email content and prompt
     * @param model Model to use for generation
     * @returns Generated response with metadata
     */
    generateResponse(request: GenerationRequest, model: string): Promise<GenerationResponse>;
    /**
     * Test API key connection
     * @returns True if connection successful
     */
    testConnection(): Promise<boolean>;
    /**
     * Cancel current generation request
     */
    cancel(): void;
}
//# sourceMappingURL=OpenAIClient.d.ts.map