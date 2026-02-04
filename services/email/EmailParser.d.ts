/**
 * Email parser for extracting and processing email content
 * Extracts thread content and preserves HTML formatting (FR-028, FR-029)
 */
export declare class EmailParser {
    /**
     * Parse email thread from HTML body
     * @param htmlBody HTML body content
     * @returns Parsed thread with messages
     */
    parseThread(htmlBody: string): Promise<{
        messages: Array<{
            from?: string;
            date?: string;
            content: string;
        }>;
        currentMessage: string;
    }>;
    /**
     * Extract plain text from HTML
     * @param html HTML content
     * @returns Plain text
     */
    extractPlainText(html: string): string;
    /**
     * Detect email client from HTML structure
     * @param html HTML content
     * @returns Email client name
     */
    detectEmailClient(html: string): 'outlook' | 'gmail' | 'unknown';
    /**
     * Combine multiple messages into context string
     * @param messages Array of messages
     * @returns Combined context string
     */
    combineMessagesForContext(messages: Array<{
        from?: string;
        date?: string;
        content: string;
    }>): string;
    /**
     * Sanitize HTML to remove dangerous content
     * @param html HTML to sanitize
     * @returns Sanitized HTML
     */
    sanitizeHtml(html: string): string;
    /**
     * Extract messages from HTML based on client
     * @private
     */
    private extractMessages;
    /**
     * Extract messages from Outlook format
     * @private
     */
    private extractOutlookMessages;
    /**
     * Extract messages from Gmail format
     * @private
     */
    private extractGmailMessages;
    /**
     * Extract messages from generic format
     * @private
     */
    private extractGenericMessages;
    /**
     * Extract metadata from message part
     * @private
     */
    private extractMessageMetadata;
    /**
     * Decode HTML entities
     * @private
     */
    private decodeHtmlEntities;
}
//# sourceMappingURL=EmailParser.d.ts.map