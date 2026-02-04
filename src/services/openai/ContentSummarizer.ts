import { TokenCounter } from './TokenCounter';

/**
 * Content summarizer for long email threads
 * Auto-summarizes older messages to fit within token limits (FR-043, FR-044)
 */
export class ContentSummarizer {
  private tokenCounter: TokenCounter;
  private summarizationStats = {
    totalSummarizations: 0,
    totalTokensSaved: 0,
  };

  constructor(tokenCounter?: TokenCounter) {
    this.tokenCounter = tokenCounter || new TokenCounter();
  }

  /**
   * Summarize content if it exceeds token limit
   * @param content Content to summarize
   * @param maxTokens Maximum tokens allowed
   * @param model Model to use for token counting
   * @returns Summarization result
   */
  summarize(
    content: string,
    maxTokens: number,
    model: string = 'gpt-4'
  ): {
    content: string;
    wasSummarized: boolean;
    originalTokenCount: number;
    finalTokenCount: number;
  } {
    const originalTokenCount = this.tokenCounter.countTokens(content, model);

    if (originalTokenCount <= maxTokens) {
      return {
        content,
        wasSummarized: false,
        originalTokenCount,
        finalTokenCount: originalTokenCount,
      };
    }

    // Summarize by keeping most recent content and summarizing older parts
    const summarized = this.performSummarization(content, maxTokens, model);
    const finalTokenCount = this.tokenCounter.countTokens(summarized, model);

    // Update stats
    this.summarizationStats.totalSummarizations++;
    this.summarizationStats.totalTokensSaved += originalTokenCount - finalTokenCount;

    return {
      content: summarized,
      wasSummarized: true,
      originalTokenCount,
      finalTokenCount,
    };
  }

  /**
   * Summarize email thread with multiple messages
   * @param messages Array of email messages
   * @param maxTokens Maximum tokens allowed
   * @param model Model to use for token counting
   * @returns Summarization result
   */
  summarizeThread(
    messages: Array<{ from: string; date: string; content: string }>,
    maxTokens: number,
    model: string = 'gpt-4'
  ): {
    content: string;
    wasSummarized: boolean;
    originalTokenCount: number;
    finalTokenCount: number;
  } {
    if (messages.length === 0) {
      return {
        content: '',
        wasSummarized: false,
        originalTokenCount: 0,
        finalTokenCount: 0,
      };
    }

    // Combine messages into thread
    const fullThread = messages
      .map((msg) => `From: ${msg.from}\nDate: ${msg.date}\n\n${msg.content}`)
      .join('\n\n---\n\n');

    const originalTokenCount = this.tokenCounter.countTokens(fullThread, model);

    if (originalTokenCount <= maxTokens) {
      return {
        content: fullThread,
        wasSummarized: false,
        originalTokenCount,
        finalTokenCount: originalTokenCount,
      };
    }

    // Keep most recent messages in full, summarize older ones
    let result = '';
    const recentMessagesCount = Math.min(3, messages.length); // Keep last 3 messages

    // Add recent messages
    for (let i = messages.length - recentMessagesCount; i < messages.length; i++) {
      const msg = messages[i];
      if (msg) {
        const msgText = `From: ${msg.from || 'Unknown'}\nDate: ${msg.date || 'Unknown'}\n\n${msg.content}\n\n---\n\n`;
        result = msgText + result;
      }
    }

    // Summarize older messages
    if (messages.length > recentMessagesCount) {
      const olderMessages = messages.slice(0, messages.length - recentMessagesCount);
      const summary = this.summarizeOlderMessages(olderMessages);
      result = `[Earlier messages summarized]\n\n${summary}\n\n---\n\n${result}`;
    }

    // Truncate if still over limit
    result = this.tokenCounter.truncateToLimit(result, maxTokens, model);
    const finalTokenCount = this.tokenCounter.countTokens(result, model);

    this.summarizationStats.totalSummarizations++;
    this.summarizationStats.totalTokensSaved += originalTokenCount - finalTokenCount;

    return {
      content: result,
      wasSummarized: true,
      originalTokenCount,
      finalTokenCount,
    };
  }

  /**
   * Extract key points from content
   * @param content Content to extract key points from
   * @returns Key points
   */
  extractKeyPoints(content: string): string {
    if (!content || content.length < 100) {
      return content;
    }

    // Simple extraction: look for important markers and sentences
    const importantMarkers = ['IMPORTANT:', 'URGENT:', 'ACTION REQUIRED:', 'DEADLINE:'];
    const lines = content.split('\n');
    const keyLines: string[] = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      if (importantMarkers.some((marker) => upperLine.includes(marker))) {
        keyLines.push(line);
      }
    }

    if (keyLines.length > 0) {
      return keyLines.join('\n');
    }

    // Fallback: take first few sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 3).join(' ');
  }

  /**
   * Estimate compression ratio for content
   * @param content Content to estimate compression for
   * @returns Compression ratio (0-1)
   */
  estimateCompressionRatio(content: string): number {
    if (!content || content.length < 100) {
      return 1.0; // No compression needed
    }

    // Estimate based on content characteristics
    const hasLists = /[•\-\*]\s/.test(content);
    const hasQuotes = /^>/.test(content);
    const repetitionScore = this.calculateRepetitionScore(content);

    let ratio = 0.7; // Base compression ratio

    if (hasLists) ratio -= 0.1;
    if (hasQuotes) ratio -= 0.1;
    if (repetitionScore > 0.3) ratio -= 0.1;

    return Math.max(0.3, Math.min(1.0, ratio));
  }

  /**
   * Get summarization statistics
   * @returns Statistics object
   */
  getSummaryStats(): {
    totalSummarizations: number;
    totalTokensSaved: number;
  } {
    return { ...this.summarizationStats };
  }

  /**
   * Perform actual summarization
   * @private
   */
  private performSummarization(content: string, maxTokens: number, model: string): string {
    // Try to keep the end of content (most recent)
    const targetRatio = maxTokens / this.tokenCounter.countTokens(content, model);

    if (targetRatio >= 0.8) {
      // Only need minor trimming
      return this.tokenCounter.truncateToLimit(content, maxTokens, model);
    }

    // More aggressive summarization needed
    const keyPoints = this.extractKeyPoints(content);
    const recentPortion = content.slice(-Math.floor(content.length * 0.3));

    let result = `[Earlier messages summarized]\n\n${keyPoints}\n\n[Recent messages]\n\n${recentPortion}`;

    // Ensure within limit
    result = this.tokenCounter.truncateToLimit(result, maxTokens, model);

    return result;
  }

  /**
   * Summarize older messages in thread
   * @private
   */
  private summarizeOlderMessages(
    messages: Array<{ from: string; date: string; content: string }>
  ): string {
    if (messages.length === 0) return '';

    const summary = `Previous conversation between ${messages.length} participants:\n`;
    const topics = messages.map((msg) => this.extractKeyPoints(msg.content)).join('\n');

    return summary + topics;
  }

  /**
   * Calculate repetition score for content
   * @private
   */
  private calculateRepetitionScore(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      if (word.length > 3) {
        // Only count meaningful words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    let repetitions = 0;
    for (const count of wordCounts.values()) {
      if (count > 2) repetitions += count - 2;
    }

    return repetitions / words.length;
  }
}
