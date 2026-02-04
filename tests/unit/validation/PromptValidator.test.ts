import { describe, it, expect } from '@jest/globals';
import {
  validatePromptTitle,
  validatePromptContent,
  validatePromptUniqueness,
  validatePrompt,
} from '../../../src/services/validation/PromptValidator';
import { PROMPT_ERRORS } from '../../../src/utils/errorMessages';
import type { Prompt } from '../../../src/models/Prompt';

describe('PromptValidator', () => {
  const mockPrompts: Prompt[] = [
    {
      id: '1',
      title: 'Professional Reply',
      content: 'Generate a professional reply',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Friendly Response',
      content: 'Generate a friendly response',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  describe('validatePromptTitle', () => {
    it('should pass validation for valid title', () => {
      const result = validatePromptTitle('My Prompt');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for empty title', () => {
      const result = validatePromptTitle('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_REQUIRED);
    });

    it('should fail validation for whitespace-only title', () => {
      const result = validatePromptTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_REQUIRED);
    });

    it('should fail validation for title exceeding 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = validatePromptTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_TOO_LONG);
    });

    it('should pass validation for exactly 100 character title', () => {
      const maxTitle = 'a'.repeat(100);
      const result = validatePromptTitle(maxTitle);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePromptContent', () => {
    it('should pass validation for valid content', () => {
      const result = validatePromptContent('Generate a reply');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for empty content', () => {
      const result = validatePromptContent('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.CONTENT_REQUIRED);
    });

    it('should fail validation for whitespace-only content', () => {
      const result = validatePromptContent('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.CONTENT_REQUIRED);
    });

    it('should fail for content exceeding 10,000 characters', () => {
      const longContent = 'a'.repeat(10001);
      const result = validatePromptContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.CONTENT_TOO_LONG);
    });

    it('should pass for exactly 10,000 character content', () => {
      const maxContent = 'a'.repeat(10000);
      const result = validatePromptContent(maxContent);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePromptUniqueness', () => {
    it('should pass validation for unique title', () => {
      const result = validatePromptUniqueness('New Unique Prompt', mockPrompts);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for duplicate title (exact match)', () => {
      const result = validatePromptUniqueness('Professional Reply', mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_DUPLICATE);
    });

    it('should fail validation for duplicate title (case insensitive)', () => {
      const result = validatePromptUniqueness('PROFESSIONAL REPLY', mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_DUPLICATE);
    });

    it('should fail for duplicate with extra whitespace', () => {
      const result = validatePromptUniqueness('  Professional Reply  ', mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_DUPLICATE);
    });

    it('should allow same title when editing current prompt', () => {
      const result = validatePromptUniqueness(
        'Professional Reply',
        mockPrompts,
        '1' // Current prompt ID
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should still catch duplicate with different ID when editing', () => {
      const result = validatePromptUniqueness(
        'Friendly Response',
        mockPrompts,
        '1' // Editing prompt 1, but title matches prompt 2
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_DUPLICATE);
    });

    it('should pass validation for empty prompts array', () => {
      const result = validatePromptUniqueness('Any Title', []);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePrompt', () => {
    it('should pass validation for complete valid prompt', () => {
      const prompt = {
        title: 'New Prompt',
        content: 'Generate a new response',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation for invalid title', () => {
      const prompt = {
        title: '',
        content: 'Valid content',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_REQUIRED);
    });

    it('should fail validation for invalid content', () => {
      const prompt = {
        title: 'Valid Title',
        content: '',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.CONTENT_REQUIRED);
    });

    it('should fail validation for duplicate title', () => {
      const prompt = {
        title: 'Professional Reply',
        content: 'Valid content',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_DUPLICATE);
    });

    it('should return first error encountered (title before content)', () => {
      const prompt = {
        title: '',
        content: '',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(PROMPT_ERRORS.TITLE_REQUIRED);
    });

    it('should validate when editing existing prompt', () => {
      const prompt = {
        id: '1',
        title: 'Professional Reply',
        content: 'Updated content',
      };
      const result = validatePrompt(prompt, mockPrompts);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
