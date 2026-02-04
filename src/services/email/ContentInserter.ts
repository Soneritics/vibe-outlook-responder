/**
 * Content inserter for adding generated responses to email body
 * Inserts above signature and supports undo via Office.js (FR-025, FR-029b)
 */
export class ContentInserter {
  private insertionHistory: Array<{
    content: string;
    position: number;
    timestamp: number;
  }> = [];

  /**
   * Insert content into email body
   * @param content Content to insert
   * @param signaturePosition Position of signature (-1 if none)
   * @returns Promise that resolves when insertion complete
   */
  async insertContent(content: string, signaturePosition: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get current body content
      Office.context.mailbox.item!.body.getAsync(
        Office.CoercionType.Html,
        async (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error?.message || 'Failed to get email body'));
            return;
          }

          const existingContent = result.value || '';

          // Determine insertion position
          let finalContent: string;

          if (signaturePosition !== -1 && signaturePosition < existingContent.length) {
            // Insert above signature
            const beforeSignature = existingContent.substring(0, signaturePosition);
            const signature = existingContent.substring(signaturePosition);

            finalContent = `${beforeSignature}${this.formatContentForInsertion(content)}\n\n${signature}`;
          } else {
            // Insert at beginning
            finalContent = `${this.formatContentForInsertion(content)}\n\n${existingContent}`;
          }

          // Set new content
          Office.context.mailbox.item!.body.setAsync(
            finalContent,
            { coercionType: Office.CoercionType.Html },
            (setResult) => {
              if (setResult.status === Office.AsyncResultStatus.Failed) {
                reject(new Error(setResult.error?.message || 'Failed to set email body'));
                return;
              }

              // Track insertion for history
              this.insertionHistory.push({
                content,
                position: signaturePosition,
                timestamp: Date.now(),
              });

              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Insert content at specific position
   * @param content Content to insert
   * @param position Character position to insert at
   * @returns Promise that resolves when insertion complete
   */
  async insertContentAtPosition(content: string, position: number): Promise<void> {
    if (position < 0) {
      throw new Error('Invalid position: must be non-negative');
    }

    return new Promise((resolve, reject) => {
      Office.context.mailbox.item!.body.getAsync(
        Office.CoercionType.Html,
        async (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error?.message || 'Failed to get email body'));
            return;
          }

          const existingContent = result.value || '';

          if (position > existingContent.length) {
            reject(new Error('Position exceeds content length'));
            return;
          }

          const before = existingContent.substring(0, position);
          const after = existingContent.substring(position);

          const finalContent = `${before}${this.formatContentForInsertion(content)}${after}`;

          Office.context.mailbox.item!.body.setAsync(
            finalContent,
            { coercionType: Office.CoercionType.Html },
            (setResult) => {
              if (setResult.status === Office.AsyncResultStatus.Failed) {
                reject(new Error(setResult.error?.message || 'Failed to set email body'));
                return;
              }

              this.insertionHistory.push({
                content,
                position,
                timestamp: Date.now(),
              });

              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Prepend content to beginning of email
   * @param content Content to prepend
   * @returns Promise that resolves when insertion complete
   */
  async prependContent(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item!.body.getAsync(
        Office.CoercionType.Html,
        async (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error?.message || 'Failed to get email body'));
            return;
          }

          const existingContent = result.value || '';
          const finalContent = `${this.formatContentForInsertion(content)}\n\n${existingContent}`;

          Office.context.mailbox.item!.body.setAsync(
            finalContent,
            { coercionType: Office.CoercionType.Html },
            (setResult) => {
              if (setResult.status === Office.AsyncResultStatus.Failed) {
                reject(new Error(setResult.error?.message || 'Failed to set email body'));
                return;
              }

              this.insertionHistory.push({
                content,
                position: 0,
                timestamp: Date.now(),
              });

              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Append content to end of email
   * @param content Content to append
   * @returns Promise that resolves when insertion complete
   */
  async appendContent(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item!.body.getAsync(
        Office.CoercionType.Html,
        async (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error(result.error?.message || 'Failed to get email body'));
            return;
          }

          const existingContent = result.value || '';
          const finalContent = `${existingContent}\n\n${this.formatContentForInsertion(content)}`;

          Office.context.mailbox.item!.body.setAsync(
            finalContent,
            { coercionType: Office.CoercionType.Html },
            (setResult) => {
              if (setResult.status === Office.AsyncResultStatus.Failed) {
                reject(new Error(setResult.error?.message || 'Failed to set email body'));
                return;
              }

              this.insertionHistory.push({
                content,
                position: existingContent.length,
                timestamp: Date.now(),
              });

              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Get insertion history
   * @returns Array of insertion records
   */
  getInsertionHistory(): Array<{
    content: string;
    position: number;
    timestamp: number;
  }> {
    return [...this.insertionHistory];
  }

  /**
   * Check if undo is available
   * Note: Actual undo is handled by Outlook's Ctrl+Z
   * @returns True if history exists
   */
  canUndo(): boolean {
    return this.insertionHistory.length > 0;
  }

  /**
   * Format content as HTML
   * @param content Content to format
   * @returns HTML formatted content
   */
  formatAsHtml(content: string): string {
    // If already HTML, return as-is
    if (/<[^>]+>/.test(content)) {
      return content;
    }

    // Convert plain text to HTML
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    return `<p>${escaped}</p>`;
  }

  /**
   * Format content for insertion with proper styling
   * @private
   */
  private formatContentForInsertion(content: string): string {
    // Ensure content is HTML
    const htmlContent = this.formatAsHtml(content);

    // Wrap in div with styling
    return `<div style="margin-bottom: 10px;">${htmlContent}</div>`;
  }
}
