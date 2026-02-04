/**
 * Email parser for extracting and processing email content
 * Extracts thread content and preserves HTML formatting (FR-028, FR-029)
 */
export class EmailParser {
  /**
   * Parse email thread from HTML body
   * @param htmlBody HTML body content
   * @returns Parsed thread with messages
   */
  async parseThread(htmlBody: string): Promise<{
    messages: Array<{ from?: string; date?: string; content: string }>;
    currentMessage: string;
  }> {
    if (!htmlBody || htmlBody.trim() === '') {
      return { messages: [], currentMessage: '' };
    }

    // Detect email client format
    const client = this.detectEmailClient(htmlBody);

    // Extract messages based on client
    const messages = this.extractMessages(htmlBody, client);

    // Get current (most recent) message
    const currentMessage = messages.length > 0 && messages[0] ? messages[0].content : '';

    return {
      messages,
      currentMessage,
    };
  }

  /**
   * Extract plain text from HTML
   * @param html HTML content
   * @returns Plain text
   */
  extractPlainText(html: string): string {
    if (!html) return '';

    // Remove scripts and styles
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Replace common block elements with newlines
    text = text.replace(/<\/?(div|p|br|li|tr)[^>]*>/gi, '\n');

    // Remove all other HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    text = this.decodeHtmlEntities(text);

    // Clean up whitespace
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.trim();

    return text;
  }

  /**
   * Detect email client from HTML structure
   * @param html HTML content
   * @returns Email client name
   */
  detectEmailClient(html: string): 'outlook' | 'gmail' | 'unknown' {
    if (html.includes('border-top:solid #B5C4DF') || html.includes('class="Signature"')) {
      return 'outlook';
    }

    if (html.includes('class="gmail_quote"') || html.includes('class="gmail_signature"')) {
      return 'gmail';
    }

    return 'unknown';
  }

  /**
   * Combine multiple messages into context string
   * @param messages Array of messages
   * @returns Combined context string
   */
  combineMessagesForContext(
    messages: Array<{ from?: string; date?: string; content: string }>
  ): string {
    if (messages.length === 0) return '';

    return messages
      .map((msg) => {
        let result = '';
        if (msg.from) result += `From: ${msg.from}\n`;
        if (msg.date) result += `Date: ${msg.date}\n`;
        result += `\n${msg.content}\n`;
        return result;
      })
      .join('\n---\n\n');
  }

  /**
   * Sanitize HTML to remove dangerous content
   * @param html HTML to sanitize
   * @returns Sanitized HTML
   */
  sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove scripts
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove styles (but keep inline styles for formatting)
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data URIs for images (keep them but strip data)
    sanitized = sanitized.replace(/src=["']data:image[^"']*["']/gi, 'src=""');

    return sanitized;
  }

  /**
   * Extract messages from HTML based on client
   * @private
   */
  private extractMessages(
    html: string,
    client: 'outlook' | 'gmail' | 'unknown'
  ): Array<{ from?: string; date?: string; content: string }> {
    // Sanitize HTML first
    const sanitized = this.sanitizeHtml(html);

    if (client === 'outlook') {
      return this.extractOutlookMessages(sanitized);
    } else if (client === 'gmail') {
      return this.extractGmailMessages(sanitized);
    } else {
      return this.extractGenericMessages(sanitized);
    }
  }

  /**
   * Extract messages from Outlook format
   * @private
   */
  private extractOutlookMessages(
    html: string
  ): Array<{ from?: string; date?: string; content: string }> {
    const messages: Array<{ from?: string; date?: string; content: string }> = [];

    // Split by Outlook separator
    const parts = html.split(/<div[^>]*border-top:solid\s+#[A-F0-9]+[^>]*>/i);

    for (const part of parts) {
      if (part.trim()) {
        const msg = this.extractMessageMetadata(part);
        messages.push(msg);
      }
    }

    return messages;
  }

  /**
   * Extract messages from Gmail format
   * @private
   */
  private extractGmailMessages(
    html: string
  ): Array<{ from?: string; date?: string; content: string }> {
    const messages: Array<{ from?: string; date?: string; content: string }> = [];

    // Split by Gmail quote blocks
    const parts = html.split(/<div[^>]*class=["']gmail_quote["'][^>]*>/i);

    for (const part of parts) {
      if (part.trim()) {
        const msg = this.extractMessageMetadata(part);
        messages.push(msg);
      }
    }

    return messages;
  }

  /**
   * Extract messages from generic format
   * @private
   */
  private extractGenericMessages(
    html: string
  ): Array<{ from?: string; date?: string; content: string }> {
    // Try to split by horizontal rules or common separators
    const parts = html.split(/<hr[^>]*>/i);

    if (parts.length > 1) {
      return parts.map((part) => this.extractMessageMetadata(part));
    }

    // If no clear separator, treat whole thing as one message
    return [this.extractMessageMetadata(html)];
  }

  /**
   * Extract metadata from message part
   * @private
   */
  private extractMessageMetadata(html: string): {
    from?: string;
    date?: string;
    content: string;
  } {
    const msg: { from?: string; date?: string; content: string } = {
      content: '',
    };

    // Try to extract From
    const fromMatch = html.match(/From:\s*([^\n<]+)/i);
    if (fromMatch && fromMatch[1]) {
      msg.from = fromMatch[1].trim();
    }

    // Try to extract Date
    const dateMatch = html.match(/Date:\s*([^\n<]+)/i);
    if (dateMatch && dateMatch[1]) {
      msg.date = dateMatch[1].trim();
    }

    // Extract content (preserve HTML structure but clean it)
    msg.content = this.extractPlainText(html);

    return msg;
  }

  /**
   * Decode HTML entities
   * @private
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    return text.replace(/&[a-z]+;|&#\d+;/gi, (entity) => {
      return entities[entity.toLowerCase()] || entity;
    });
  }
}
