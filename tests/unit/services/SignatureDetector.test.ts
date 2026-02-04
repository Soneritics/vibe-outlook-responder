import { SignatureDetector } from '../../../src/services/email/SignatureDetector';

describe('SignatureDetector', () => {
  let detector: SignatureDetector;

  beforeEach(() => {
    detector = new SignatureDetector();
  });

  describe('detectSignature', () => {
    it('should detect signature with "Sent from" pattern', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Sent from my iPhone</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect signature with "Best regards" pattern', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John Doe</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect signature with "Sincerely" pattern', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Sincerely,</p>
          <p>Jane Smith</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect signature with horizontal line', () => {
      const content = `
        <div>
          <p>Email content</p>
          <hr>
          <p>Company Name</p>
          <p>Phone: 123-456-7890</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect signature with email address', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>John Doe</p>
          <p>john.doe@example.com</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should return -1 when no signature found', () => {
      const content = '<div><p>Simple email with no signature</p></div>';

      const position = detector.detectSignature(content);

      expect(position).toBe(-1);
    });

    it('should detect signature with phone number', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>John Doe</p>
          <p>Tel: +1 (555) 123-4567</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect signature with multiple indicators', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John Doe</p>
          <p>john.doe@example.com</p>
          <p>Phone: 123-456-7890</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should handle empty content', () => {
      const position = detector.detectSignature('');

      expect(position).toBe(-1);
    });

    it('should detect signature in plain text', () => {
      const content = `
        Email content here.
        
        Best regards,
        John Doe
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect Outlook signature class', () => {
      const content = `
        <div>
          <p>Email content</p>
          <div class="Signature">
            <p>John Doe</p>
            <p>Company</p>
          </div>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should detect Gmail signature class', () => {
      const content = `
        <div>
          <p>Email content</p>
          <div class="gmail_signature">
            <p>John Doe</p>
          </div>
        </div>
      `;

      const position = detector.detectSignature(content);

      expect(position).toBeGreaterThan(0);
    });

    it('should prefer earlier signature if multiple found', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John</p>
          <p>More content</p>
          <p>Sincerely,</p>
          <p>Jane</p>
        </div>
      `;

      const position = detector.detectSignature(content);

      // Should find the first signature
      expect(position).toBeGreaterThan(0);
      expect(position).toBeLessThan(content.indexOf('Sincerely'));
    });
  });

  describe('getSignatureConfidence', () => {
    it('should return high confidence for strong indicators', () => {
      const content = `
        <div>
          <p>Email content</p>
          <div class="Signature">
            <p>Best regards,</p>
            <p>John Doe</p>
            <p>john@example.com</p>
            <p>Phone: 123-456-7890</p>
          </div>
        </div>
      `;

      const confidence = detector.getSignatureConfidence(content);

      expect(confidence).toBeGreaterThan(0.8);
    });

    it('should return medium confidence for some indicators', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John</p>
        </div>
      `;

      const confidence = detector.getSignatureConfidence(content);

      expect(confidence).toBeGreaterThan(0.3);
      expect(confidence).toBeLessThan(0.8);
    });

    it('should return low confidence when no signature', () => {
      const content = '<div><p>Simple email</p></div>';

      const confidence = detector.getSignatureConfidence(content);

      expect(confidence).toBe(0);
    });
  });

  describe('extractSignature', () => {
    it('should extract signature content', () => {
      const content = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John Doe</p>
        </div>
      `;

      const signature = detector.extractSignature(content);

      expect(signature).toContain('Best regards');
      expect(signature).toContain('John Doe');
    });

    it('should return empty string when no signature', () => {
      const content = '<div><p>Email content</p></div>';

      const signature = detector.extractSignature(content);

      expect(signature).toBe('');
    });

    it('should extract only signature part', () => {
      const content = `
        <div>
          <p>Email content that should not be in signature</p>
          <p>Best regards,</p>
          <p>John Doe</p>
        </div>
      `;

      const signature = detector.extractSignature(content);

      expect(signature).not.toContain('Email content that should not');
      expect(signature).toContain('Best regards');
    });
  });

  describe('isLikelySignature', () => {
    it('should return true for signature-like text', () => {
      const text = 'Best regards,\nJohn Doe\njohn@example.com';

      expect(detector.isLikelySignature(text)).toBe(true);
    });

    it('should return false for regular content', () => {
      const text = 'This is just regular email content without signature markers.';

      expect(detector.isLikelySignature(text)).toBe(false);
    });

    it('should return false for empty text', () => {
      expect(detector.isLikelySignature('')).toBe(false);
    });
  });

  describe('getSignaturePatterns', () => {
    it('should return list of signature patterns', () => {
      const patterns = detector.getSignaturePatterns();

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns).toContain('Best regards');
      expect(patterns).toContain('Sincerely');
    });
  });
});
