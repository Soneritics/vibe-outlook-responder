import { describe, it, expect } from '@jest/globals';
import { validateApiKeyFormat, maskApiKey } from '../../../src/services/validation/ApiKeyValidator';
import { API_KEY_ERRORS } from '../../../src/utils/errorMessages';

describe('ApiKeyValidator', () => {
  describe('validateApiKeyFormat', () => {
    it('should pass validation for valid API key', () => {
      const result = validateApiKeyFormat('sk-proj1234567890abcdefghij');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for empty string', () => {
      const result = validateApiKeyFormat('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(API_KEY_ERRORS.REQUIRED);
    });

    it('should fail validation for whitespace-only string', () => {
      const result = validateApiKeyFormat('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(API_KEY_ERRORS.REQUIRED);
    });

    it('should fail validation for key without sk- prefix', () => {
      const result = validateApiKeyFormat('proj1234567890abcdefghij');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(API_KEY_ERRORS.INVALID_FORMAT);
    });

    it('should fail validation for key shorter than minimum length', () => {
      const result = validateApiKeyFormat('sk-short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(API_KEY_ERRORS.INVALID_FORMAT);
    });

    it('should pass validation for exactly minimum length key', () => {
      const result = validateApiKeyFormat('sk-12345678901234567');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should pass validation for very long API key', () => {
      const longKey = 'sk-' + 'a'.repeat(100);
      const result = validateApiKeyFormat(longKey);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('maskApiKey', () => {
    it('should mask API key correctly', () => {
      const apiKey = 'sk-proj1234567890abcdefghijklmnopqrstuvwxyz9';
      const masked = maskApiKey(apiKey);
      expect(masked).toBe('sk-proj****...****xyz9');
    });

    it('should mask short API key with stars only', () => {
      const apiKey = 'sk-short';
      const masked = maskApiKey(apiKey);
      expect(masked).toBe('****');
    });

    it('should handle empty string', () => {
      const masked = maskApiKey('');
      expect(masked).toBe('****');
    });

    it('should handle very short string', () => {
      const masked = maskApiKey('sk-');
      expect(masked).toBe('****');
    });

    it('should preserve first 7 and last 4 characters', () => {
      const apiKey = 'sk-test1234567890123456789';
      const masked = maskApiKey(apiKey);
      expect(masked.startsWith('sk-test')).toBe(true);
      expect(masked.endsWith('6789')).toBe(true);
      expect(masked).toContain('****...****');
    });
  });
});
