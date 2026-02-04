/**
 * Content inserter for adding generated responses to email body
 * Inserts above signature and supports undo via Office.js (FR-025, FR-029b)
 */
export declare class ContentInserter {
    private insertionHistory;
    /**
     * Insert content into email body
     * @param content Content to insert
     * @param signaturePosition Position of signature (-1 if none)
     * @returns Promise that resolves when insertion complete
     */
    insertContent(content: string, signaturePosition: number): Promise<void>;
    /**
     * Insert content at specific position
     * @param content Content to insert
     * @param position Character position to insert at
     * @returns Promise that resolves when insertion complete
     */
    insertContentAtPosition(content: string, position: number): Promise<void>;
    /**
     * Prepend content to beginning of email
     * @param content Content to prepend
     * @returns Promise that resolves when insertion complete
     */
    prependContent(content: string): Promise<void>;
    /**
     * Append content to end of email
     * @param content Content to append
     * @returns Promise that resolves when insertion complete
     */
    appendContent(content: string): Promise<void>;
    /**
     * Get insertion history
     * @returns Array of insertion records
     */
    getInsertionHistory(): Array<{
        content: string;
        position: number;
        timestamp: number;
    }>;
    /**
     * Check if undo is available
     * Note: Actual undo is handled by Outlook's Ctrl+Z
     * @returns True if history exists
     */
    canUndo(): boolean;
    /**
     * Format content as HTML
     * @param content Content to format
     * @returns HTML formatted content
     */
    formatAsHtml(content: string): string;
    /**
     * Format content for insertion with proper styling
     * @private
     */
    private formatContentForInsertion;
}
//# sourceMappingURL=ContentInserter.d.ts.map