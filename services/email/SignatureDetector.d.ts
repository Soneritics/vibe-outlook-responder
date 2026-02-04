/**
 * Signature detector for identifying email signatures
 * Uses heuristic detection to find signature position (FR-025a)
 */
export declare class SignatureDetector {
    private readonly SIGNATURE_PATTERNS;
    private readonly SIGNATURE_CLASSES;
    /**
     * Detect signature position in email content
     * @param content Email content (HTML or plain text)
     * @returns Position of signature start, or -1 if not found
     */
    detectSignature(content: string): number;
    /**
     * Get confidence score for signature detection
     * @param content Email content
     * @returns Confidence score (0-1)
     */
    getSignatureConfidence(content: string): number;
    /**
     * Extract signature content
     * @param content Email content
     * @returns Signature content or empty string
     */
    extractSignature(content: string): string;
    /**
     * Check if text is likely a signature
     * @param text Text to check
     * @returns True if likely signature
     */
    isLikelySignature(text: string): boolean;
    /**
     * Get list of signature patterns
     * @returns Array of patterns
     */
    getSignaturePatterns(): string[];
    /**
     * Detect signature by HTML class
     * @private
     */
    private detectByClass;
    /**
     * Detect signature by text patterns
     * @private
     */
    private detectByPattern;
    /**
     * Detect signature by structural elements
     * @private
     */
    private detectByStructure;
    /**
     * Verify if position is likely start of signature
     * @private
     */
    private verifySignatureStart;
}
//# sourceMappingURL=SignatureDetector.d.ts.map