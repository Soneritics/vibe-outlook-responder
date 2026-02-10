import { useState, useCallback, useRef } from 'react';
import { OpenAIClient } from '../../services/openai/OpenAIClient';
import { TokenCounter } from '../../services/openai/TokenCounter';
import { ContentSummarizer } from '../../services/openai/ContentSummarizer';
import { EmailParser } from '../../services/email/EmailParser';
import { SignatureDetector } from '../../services/email/SignatureDetector';
import { ContentInserter } from '../../services/email/ContentInserter';
import { GenerationRequest } from '../../models/GenerationRequest';
import { SupportedModel } from '../../models/Settings';
import { GenerationStep } from '../components/generation/GenerationProgress';

interface UseGenerationResult {
  isGenerating: boolean;
  currentStep: GenerationStep;
  error: string | null;
  wasSummarized: boolean;
  originalTokenCount: number | null;
  finalTokenCount: number | null;
  generate: (promptContent: string, apiKey: string, model: string) => Promise<void>;
  cancel: () => void;
  retry: () => void;
  clearError: () => void;
}

/**
 * Hook for orchestrating AI generation flow
 * Handles all steps from email parsing to content insertion
 * Implements FR-024 through FR-029d
 */
export const useGeneration = (): UseGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('preparing');
  const [error, setError] = useState<string | null>(null);
  const [wasSummarized, setWasSummarized] = useState(false);
  const [originalTokenCount, setOriginalTokenCount] = useState<number | null>(null);
  const [finalTokenCount, setFinalTokenCount] = useState<number | null>(null);

  const openAIClientRef = useRef<OpenAIClient | null>(null);
  const lastRequestRef = useRef<{
    promptContent: string;
    apiKey: string;
    model: string;
  } | null>(null);

  /**
   * Generate AI response
   */
  const generate = useCallback(async (promptContent: string, apiKey: string, model: string) => {
    // Store for retry
    lastRequestRef.current = { promptContent, apiKey, model };

    setIsGenerating(true);
    setError(null);
    setCurrentStep('preparing');
    setWasSummarized(false);
    setOriginalTokenCount(null);
    setFinalTokenCount(null);

    try {
      // Step 1: Prepare request
      const emailParser = new EmailParser();
      const tokenCounter = new TokenCounter();
      const contentSummarizer = new ContentSummarizer(tokenCounter);
      const signatureDetector = new SignatureDetector();
      const contentInserter = new ContentInserter();

      // Get email body
      const emailBody = await getEmailBody();

      if (!emailBody || emailBody.trim() === '') {
        // FR-029d: Handle no email content
        throw new Error(
          'No email content found. Please ensure you are composing a reply or have email content.'
        );
      }

      // Parse email thread (FR-028)
      const parsedThread = await emailParser.parseThread(emailBody);
      const threadContext = emailParser.combineMessagesForContext(parsedThread.messages);

      // Check token limits and summarize if needed (FR-043)
      const modelLimit = tokenCounter.getModelLimit(model);
      const maxContextTokens = Math.floor(modelLimit * 0.6); // Leave room for prompt and response

      const summarized = contentSummarizer.summarize(threadContext, maxContextTokens, model);

      // Notify if summarization occurred (FR-044)
      if (summarized.wasSummarized) {
        console.warn(
          `Content summarized: ${summarized.originalTokenCount} → ${summarized.finalTokenCount} tokens`
        );
        setWasSummarized(true);
        setOriginalTokenCount(summarized.originalTokenCount || 0);
        setFinalTokenCount(summarized.finalTokenCount || 0);
      }

      // Create generation request
      const request: GenerationRequest = {
        emailContent: summarized.content,
        promptContent,
        timestamp: new Date().toISOString(),
        model: 'gpt-4' as SupportedModel, // Using GPT-4 as default
      };

      // Step 2: Send to OpenAI
      setCurrentStep('sending');

      // Initialize OpenAI client
      openAIClientRef.current = new OpenAIClient(apiKey);

      // Step 3: Generate response
      setCurrentStep('generating');

      const response = await openAIClientRef.current.generateResponse(request, model);

      // Step 4: Insert response
      setCurrentStep('done');

      // Detect signature position (FR-025a)
      const signaturePosition = signatureDetector.detectSignature(emailBody);

      // Insert above signature or at top (FR-025)
      await contentInserter.insertContent(response.generatedText, signaturePosition);

      // Complete
      setIsGenerating(false);
    } catch (err: unknown) {
      // Handle errors gracefully (FR-027)
      setError(getErrorMessage(err));
      setIsGenerating(false);
    }
  }, []);

  /**
   * Cancel current generation
   */
  const cancel = useCallback(() => {
    if (openAIClientRef.current) {
      openAIClientRef.current.cancel();
    }
    setIsGenerating(false);
    setError('Generation cancelled');
  }, []);

  /**
   * Retry last generation
   */
  const retry = useCallback(() => {
    if (lastRequestRef.current) {
      const { promptContent, apiKey, model } = lastRequestRef.current;
      generate(promptContent, apiKey, model);
    }
  }, [generate]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isGenerating,
    currentStep,
    error,
    wasSummarized,
    originalTokenCount,
    finalTokenCount,
    generate,
    cancel,
    retry,
    clearError,
  };
};

/**
 * Get email body from Office context
 */
function getEmailBody(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!Office.context.mailbox?.item?.body) {
      reject(new Error('Not in compose mode'));
      return;
    }

    Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(new Error(result.error?.message || 'Failed to get email body'));
        return;
      }

      resolve(result.value || '');
    });
  });
}

/**
 * Convert error to user-friendly message
 */
function getErrorMessage(error: unknown): string {
  const err = error as { message?: string; toString?: () => string };
  const message = err.message || err.toString?.() || String(error);

  // API key errors (FR-027)
  if (message.includes('Invalid API key') || message.includes('401')) {
    return 'Invalid API key. Please check your settings and ensure your key is correct.';
  }

  // Rate limiting (FR-027)
  if (message.includes('Rate limit') || message.includes('429')) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }

  // API unavailable (FR-027)
  if (message.includes('temporarily unavailable') || message.includes('500')) {
    return 'OpenAI API is temporarily unavailable. Please try again later.';
  }

  // No API key configured (FR-027)
  if (message.includes('API key is required')) {
    return 'No API key configured. Please configure your API key in settings.';
  }

  // Content policy violations (FR-027a)
  if (message.includes('policy') || message.includes('400')) {
    return `Content policy violation: ${message}`;
  }

  // Cancellation
  if (message.includes('cancelled') || message.includes('aborted')) {
    return 'Generation cancelled';
  }

  // Default error
  return `An error occurred: ${message}`;
}
