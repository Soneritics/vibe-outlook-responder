import { TokenCounter } from './TokenCounter';
/**
 * Content summarizer for long email threads
 * Auto-summarizes older messages to fit within token limits (FR-043, FR-044)
 */
export declare class ContentSummarizer {
    private tokenCounter;
    private summarizationStats;
    constructor(tokenCounter?: TokenCounter);
    /**
     * Summarize content if it exceeds token limit
     * @param content Content to summarize
     * @param maxTokens Maximum tokens allowed
     * @param model Model to use for token counting
     * @returns Summarization result
     */
    summarize(content: string, maxTokens: number, model?: string): {
        content: string;
        wasSummarized: boolean;
        originalTokenCount: number;
        finalTokenCount: number;
    };
    /**
     * Summarize email thread with multiple messages
     * @param messages Array of email messages
     * @param maxTokens Maximum tokens allowed
     * @param model Model to use for token counting
     * @returns Summarization result
     */
    summarizeThread(messages: Array<{
        from: string;
        date: string;
        content: string;
    }>, maxTokens: number, model?: string): {
        content: string;
        wasSummarized: boolean;
        originalTokenCount: number;
        finalTokenCount: number;
    };
    /**
     * Extract key points from content
     * @param content Content to extract key points from
     * @returns Key points
     */
    extractKeyPoints(content: string): string;
    /**
     * Estimate compression ratio for content
     * @param content Content to estimate compression for
     * @returns Compression ratio (0-1)
     */
    estimateCompressionRatio(content: string): number;
    /**
     * Get summarization statistics
     * @returns Statistics object
     */
    getSummaryStats(): {
        totalSummarizations: number;
        totalTokensSaved: number;
    };
    /**
     * Perform actual summarization
     * @private
     */
    private performSummarization;
    /**
     * Summarize older messages in thread
     * @private
     */
    private summarizeOlderMessages;
    /**
     * Calculate repetition score for content
     * @private
     */
    private calculateRepetitionScore;
}
//# sourceMappingURL=ContentSummarizer.d.ts.map