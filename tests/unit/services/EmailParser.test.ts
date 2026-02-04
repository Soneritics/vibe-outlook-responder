import { EmailParser } from '../../../src/services/email/EmailParser';

describe('EmailParser', () => {
  let parser: EmailParser;

  beforeEach(() => {
    parser = new EmailParser();
  });

  describe('parseThread', () => {
    it('should parse simple email thread', async () => {
      const htmlBody = `
        <div>
          <p>This is the latest reply.</p>
          <hr>
          <div>
            <p>Original email content.</p>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.currentMessage).toContain('latest reply');
    });

    it('should extract multiple messages from thread', async () => {
      const htmlBody = `
        <div>
          <p>Third message</p>
          <div class="gmail_quote">
            <p>Second message</p>
            <div class="gmail_quote">
              <p>First message</p>
            </div>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages.length).toBeGreaterThanOrEqual(2);
    });

    it('should preserve HTML formatting', async () => {
      const htmlBody = `
        <div>
          <p><strong>Bold text</strong></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.currentMessage).toContain('Bold text');
    });

    it('should handle empty email body', async () => {
      const result = await parser.parseThread('');

      expect(result.messages).toHaveLength(0);
      expect(result.currentMessage).toBe('');
    });

    it('should handle plain text email', async () => {
      const plainText = 'This is a plain text email.';

      const result = await parser.parseThread(plainText);

      expect(result.currentMessage).toContain('plain text email');
    });

    it('should extract sender information', async () => {
      const htmlBody = `
        <div>
          <p>Reply content</p>
          <div>
            <p><strong>From:</strong> john@example.com</p>
            <p>Original message</p>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages[0].from).toBeDefined();
    });

    it('should extract date information', async () => {
      const htmlBody = `
        <div>
          <p>Reply content</p>
          <div>
            <p><strong>Date:</strong> January 1, 2024</p>
            <p>Original message</p>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages[0].date).toBeDefined();
    });

    it('should handle Outlook quote format', async () => {
      const htmlBody = `
        <div>
          <p>New reply</p>
          <div style="border:none;border-top:solid #B5C4DF 1.0pt;">
            <p>Original message</p>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should handle Gmail quote format', async () => {
      const htmlBody = `
        <div>
          <p>New reply</p>
          <div class="gmail_quote">
            <p>Original message</p>
          </div>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should strip inline images and attachments', async () => {
      const htmlBody = `
        <div>
          <p>Message with image</p>
          <img src="data:image/png;base64,..." />
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.currentMessage).not.toContain('data:image');
    });

    it('should remove scripts and styles', async () => {
      const htmlBody = `
        <div>
          <p>Safe content</p>
          <script>alert('xss')</script>
          <style>.class { color: red; }</style>
        </div>
      `;

      const result = await parser.parseThread(htmlBody);

      expect(result.currentMessage).not.toContain('<script>');
      expect(result.currentMessage).not.toContain('<style>');
    });
  });

  describe('extractPlainText', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const text = parser.extractPlainText(html);

      expect(text).toBe('Hello world');
    });

    it('should preserve line breaks', () => {
      const html = '<p>Line 1</p><p>Line 2</p>';
      const text = parser.extractPlainText(html);

      expect(text).toContain('\n');
    });

    it('should handle nested elements', () => {
      const html = '<div><p>Outer <span>Inner</span></p></div>';
      const text = parser.extractPlainText(html);

      expect(text).toContain('Outer Inner');
    });

    it('should handle empty HTML', () => {
      const text = parser.extractPlainText('');

      expect(text).toBe('');
    });
  });

  describe('detectEmailClient', () => {
    it('should detect Outlook format', () => {
      const html = '<div style="border-top:solid #B5C4DF 1.0pt;">Content</div>';
      const client = parser.detectEmailClient(html);

      expect(client).toBe('outlook');
    });

    it('should detect Gmail format', () => {
      const html = '<div class="gmail_quote">Content</div>';
      const client = parser.detectEmailClient(html);

      expect(client).toBe('gmail');
    });

    it('should return unknown for unrecognized format', () => {
      const html = '<div>Content</div>';
      const client = parser.detectEmailClient(html);

      expect(client).toBe('unknown');
    });
  });

  describe('combineMessagesForContext', () => {
    it('should combine multiple messages', () => {
      const messages = [
        { from: 'alice@example.com', date: '2024-01-01', content: 'First message' },
        { from: 'bob@example.com', date: '2024-01-02', content: 'Second message' },
      ];

      const combined = parser.combineMessagesForContext(messages);

      expect(combined).toContain('First message');
      expect(combined).toContain('Second message');
    });

    it('should include sender and date info', () => {
      const messages = [
        { from: 'alice@example.com', date: '2024-01-01', content: 'Message' },
      ];

      const combined = parser.combineMessagesForContext(messages);

      expect(combined).toContain('alice@example.com');
      expect(combined).toContain('2024-01-01');
    });

    it('should handle empty array', () => {
      const combined = parser.combineMessagesForContext([]);

      expect(combined).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove dangerous tags', () => {
      const html = '<div>Safe <script>alert("xss")</script></div>';
      const sanitized = parser.sanitizeHtml(html);

      expect(sanitized).not.toContain('<script>');
    });

    it('should preserve safe formatting', () => {
      const html = '<div><p><strong>Bold</strong> <em>Italic</em></p></div>';
      const sanitized = parser.sanitizeHtml(html);

      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert()">Content</div>';
      const sanitized = parser.sanitizeHtml(html);

      expect(sanitized).not.toContain('onclick');
    });
  });
});
