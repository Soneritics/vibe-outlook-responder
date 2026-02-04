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
export declare const useGeneration: () => UseGenerationResult;
export {};
//# sourceMappingURL=useGeneration.d.ts.map