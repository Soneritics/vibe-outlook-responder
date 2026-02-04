/**
 * Signature detector for identifying email signatures
 * Uses heuristic detection to find signature position (FR-025a)
 */
export class SignatureDetector {
  private readonly SIGNATURE_PATTERNS = [
    'Best regards',
    'Sincerely',
    'Regards',
    'Thank you',
    'Thanks',
    'Cheers',
    'Warm regards',
    'Kind regards',
    'Sent from my',
    'Get Outlook for',
  ];

  private readonly SIGNATURE_CLASSES = [
    'Signature',
    'signature',
    'gmail_signature',
    'email-signature',
  ];

  /**
   * Detect signature position in email content
   * @param content Email content (HTML or plain text)
   * @returns Position of signature start, or -1 if not found
   */
  detectSignature(content: string): number {
    if (!content || content.trim() === '') {
      return -1;
    }

    // Try class-based detection first (most reliable)
    const classPosition = this.detectByClass(content);
    if (classPosition !== -1) {
      return classPosition;
    }

    // Try pattern-based detection
    const patternPosition = this.detectByPattern(content);
    if (patternPosition !== -1) {
      return patternPosition;
    }

    // Try structural detection
    const structuralPosition = this.detectByStructure(content);
    if (structuralPosition !== -1) {
      return structuralPosition;
    }

    return -1;
  }

  /**
   * Get confidence score for signature detection
   * @param content Email content
   * @returns Confidence score (0-1)
   */
  getSignatureConfidence(content: string): number {
    if (!content) return 0;

    let score = 0;
    let indicators = 0;

    // Check for class-based indicators
    for (const className of this.SIGNATURE_CLASSES) {
      if (content.includes(`class="${className}"`) || content.includes(`class='${className}'`)) {
        score += 0.4;
        indicators++;
      }
    }

    // Check for pattern indicators
    const lowerContent = content.toLowerCase();
    for (const pattern of this.SIGNATURE_PATTERNS) {
      if (lowerContent.includes(pattern.toLowerCase())) {
        score += 0.2;
        indicators++;
      }
    }

    // Check for email addresses
    if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(content)) {
      score += 0.2;
      indicators++;
    }

    // Check for phone numbers
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(content)) {
      score += 0.1;
      indicators++;
    }

    // Check for horizontal rules
    if (/<hr[\s>]/i.test(content)) {
      score += 0.1;
      indicators++;
    }

    return indicators > 0 ? Math.min(score, 1.0) : 0;
  }

  /**
   * Extract signature content
   * @param content Email content
   * @returns Signature content or empty string
   */
  extractSignature(content: string): string {
    const position = this.detectSignature(content);

    if (position === -1) {
      return '';
    }

    return content.substring(position);
  }

  /**
   * Check if text is likely a signature
   * @param text Text to check
   * @returns True if likely signature
   */
  isLikelySignature(text: string): boolean {
    if (!text || text.length < 3) return false;

    const lowerText = text.toLowerCase();

    // Check for common patterns
    for (const pattern of this.SIGNATURE_PATTERNS) {
      if (lowerText.includes(pattern.toLowerCase())) {
        return true;
      }
    }

    // Check for email or phone
    return /@[a-z0-9.-]+\.[a-z]{2,}/i.test(text) || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  }

  /**
   * Get list of signature patterns
   * @returns Array of patterns
   */
  getSignaturePatterns(): string[] {
    return [...this.SIGNATURE_PATTERNS];
  }

  /**
   * Detect signature by HTML class
   * @private
   */
  private detectByClass(content: string): number {
    for (const className of this.SIGNATURE_CLASSES) {
      const classPattern = new RegExp(`<[^>]*class=["']${className}["'][^>]*>`, 'i');
      const match = content.match(classPattern);

      if (match && match.index !== undefined) {
        return match.index;
      }
    }

    return -1;
  }

  /**
   * Detect signature by text patterns
   * @private
   */
  private detectByPattern(content: string): number {
    let earliestPosition = -1;

    for (const pattern of this.SIGNATURE_PATTERNS) {
      const position = content.toLowerCase().indexOf(pattern.toLowerCase());

      if (position !== -1) {
        if (earliestPosition === -1 || position < earliestPosition) {
          // Verify this looks like a signature start
          if (this.verifySignatureStart(content, position)) {
            earliestPosition = position;
          }
        }
      }
    }

    return earliestPosition;
  }

  /**
   * Detect signature by structural elements
   * @private
   */
  private detectByStructure(content: string): number {
    // Look for horizontal rules
    const hrMatch = content.match(/<hr[\s>]/i);
    if (hrMatch && hrMatch.index !== undefined) {
      return hrMatch.index;
    }

    // Look for significant whitespace followed by contact info
    const lines = content.split('\n');
    let emptyLines = 0;
    let position = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';

      if (line === '') {
        emptyLines++;
      } else {
        if (emptyLines >= 2) {
          // After significant whitespace, check if this looks like signature
          if (this.isLikelySignature(line)) {
            return position;
          }
        }
        emptyLines = 0;
      }

      position += (lines[i]?.length || 0) + 1; // +1 for newline
    }

    return -1;
  }

  /**
   * Verify if position is likely start of signature
   * @private
   */
  private verifySignatureStart(content: string, position: number): boolean {
    // Check if there's meaningful content before this position
    const beforeContent = content.substring(0, position).trim();

    // Should have some content before signature
    if (beforeContent.length < 50) {
      return false;
    }

    // Check context after position
    const afterContent = content.substring(position, position + 200);

    // Should have some signature-like content after
    return this.isLikelySignature(afterContent) || /@[a-z0-9.-]+\.[a-z]{2,}/i.test(afterContent);
  }
}
