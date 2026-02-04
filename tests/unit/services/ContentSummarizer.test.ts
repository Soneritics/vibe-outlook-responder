import { ContentSummarizer } from '../../../src/services/openai/ContentSummarizer';
import { TokenCounter } from '../../../src/services/openai/TokenCounter';

jest.mock('../../../src/services/openai/TokenCounter');

describe('ContentSummarizer', () => {
  let summarizer: ContentSummarizer;
  let mockTokenCounter: jest.Mocked<TokenCounter>;

  beforeEach(() => {
    mockTokenCounter = new TokenCounter() as jest.Mocked<TokenCounter>;
    summarizer = new ContentSummarizer(mockTokenCounter);
  });

  describe('summarize', () => {
    it('should return original content if under limit', () => {
      const content = 'Short email content';
      mockTokenCounter.countTokens.mockReturnValue(50);

      const result = summarizer.summarize(content, 1000);

      expect(result.content).toBe(content);
      expect(result.wasSummarized).toBe(false);
      expect(result.originalTokenCount).toBe(50);
      expect(result.finalTokenCount).toBe(50);
    });

    it('should summarize content over limit', () => {
      const longContent = 'a'.repeat(5000);
      mockTokenCounter.countTokens.mockReturnValueOnce(2000).mockReturnValueOnce(800);

      const result = summarizer.summarize(longContent, 1000);

      expect(result.content).not.toBe(longContent);
      expect(result.wasSummarized).toBe(true);
      expect(result.originalTokenCount).toBe(2000);
      expect(result.finalTokenCount).toBe(800);
    });

    it('should preserve most recent messages', () => {
      const email1 = 'First email from yesterday';
      const email2 = 'Second email today';
      const email3 = 'Most recent email';
      const content = `${email1}\n\n${email2}\n\n${email3}`;

      mockTokenCounter.countTokens.mockReturnValueOnce(500).mockReturnValueOnce(200);

      const result = summarizer.summarize(content, 300);

      // Most recent should be preserved
      expect(result.content).toContain(email3);
      expect(result.wasSummarized).toBe(true);
    });

    it('should handle empty content', () => {
      mockTokenCounter.countTokens.mockReturnValue(0);

      const result = summarizer.summarize('', 1000);

      expect(result.content).toBe('');
      expect(result.wasSummarized).toBe(false);
    });

    it('should add summary indicator', () => {
      const longContent = 'a'.repeat(5000);
      mockTokenCounter.countTokens.mockReturnValueOnce(2000).mockReturnValueOnce(800);

      const result = summarizer.summarize(longContent, 1000);

      expect(result.content).toContain('[Earlier messages summarized]');
    });
  });

  describe('summarizeThread', () => {
    it('should summarize thread with multiple messages', () => {
      const messages = [
        { from: 'Alice', date: '2024-01-01', content: 'First message' },
        { from: 'Bob', date: '2024-01-02', content: 'Second message' },
        { from: 'Alice', date: '2024-01-03', content: 'Third message' },
      ];

      mockTokenCounter.countTokens.mockReturnValue(50);

      const result = summarizer.summarizeThread(messages, 1000);

      expect(result.content).toBeDefined();
      expect(result.wasSummarized).toBe(false);
    });

    it('should keep recent messages in full detail', () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        from: `User${i}`,
        date: `2024-01-${i + 1}`,
        content: `Message ${i}`,
      }));

      mockTokenCounter.countTokens.mockReturnValueOnce(2000).mockReturnValueOnce(500);

      const result = summarizer.summarizeThread(messages, 1000);

      // Last message should be preserved
      expect(result.content).toContain('Message 9');
      expect(result.wasSummarized).toBe(true);
    });

    it('should handle thread with one message', () => {
      const messages = [{ from: 'Alice', date: '2024-01-01', content: 'Only message' }];

      mockTokenCounter.countTokens.mockReturnValue(20);

      const result = summarizer.summarizeThread(messages, 1000);

      expect(result.content).toContain('Only message');
      expect(result.wasSummarized).toBe(false);
    });

    it('should handle empty thread', () => {
      mockTokenCounter.countTokens.mockReturnValue(0);

      const result = summarizer.summarizeThread([], 1000);

      expect(result.content).toBe('');
      expect(result.wasSummarized).toBe(false);
    });
  });

  describe('extractKeyPoints', () => {
    it('should extract key points from long content', () => {
      const content =
        'Important: The meeting is scheduled for Monday. Also, please review the attached document. Finally, confirm your attendance.';

      const keyPoints = summarizer.extractKeyPoints(content);

      expect(keyPoints).toBeDefined();
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(keyPoints.length).toBeLessThan(content.length);
    });

    it('should preserve important markers', () => {
      const content = 'URGENT: This requires immediate attention!';

      const keyPoints = summarizer.extractKeyPoints(content);

      expect(keyPoints.toLowerCase()).toContain('urgent');
    });

    it('should handle short content', () => {
      const content = 'Short message';

      const keyPoints = summarizer.extractKeyPoints(content);

      expect(keyPoints).toBe(content);
    });

    it('should handle empty content', () => {
      const keyPoints = summarizer.extractKeyPoints('');

      expect(keyPoints).toBe('');
    });
  });

  describe('estimateCompressionRatio', () => {
    it('should estimate compression for typical email', () => {
      const content = 'This is a typical email with some content that can be compressed.';

      const ratio = summarizer.estimateCompressionRatio(content);

      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });

    it('should return 1 for very short content', () => {
      const content = 'Hi';

      const ratio = summarizer.estimateCompressionRatio(content);

      expect(ratio).toBe(1);
    });

    it('should handle empty content', () => {
      const ratio = summarizer.estimateCompressionRatio('');

      expect(ratio).toBe(1);
    });
  });

  describe('getSummaryStats', () => {
    it('should return stats after summarization', () => {
      const longContent = 'a'.repeat(5000);
      mockTokenCounter.countTokens.mockReturnValueOnce(2000).mockReturnValueOnce(800);

      summarizer.summarize(longContent, 1000);
      const stats = summarizer.getSummaryStats();

      expect(stats.totalSummarizations).toBe(1);
      expect(stats.totalTokensSaved).toBeGreaterThan(0);
    });

    it('should accumulate stats across multiple calls', () => {
      mockTokenCounter.countTokens
        .mockReturnValueOnce(2000)
        .mockReturnValueOnce(800)
        .mockReturnValueOnce(1500)
        .mockReturnValueOnce(700);

      summarizer.summarize('a'.repeat(5000), 1000);
      summarizer.summarize('b'.repeat(4000), 1000);

      const stats = summarizer.getSummaryStats();

      expect(stats.totalSummarizations).toBe(2);
    });

    it('should return zero stats initially', () => {
      const stats = summarizer.getSummaryStats();

      expect(stats.totalSummarizations).toBe(0);
      expect(stats.totalTokensSaved).toBe(0);
    });
  });
});
