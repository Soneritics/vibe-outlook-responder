import React from 'react';
export type GenerationStep = 'preparing' | 'sending' | 'generating' | 'done';
interface GenerationProgressProps {
    currentStep: GenerationStep;
    onCancel: () => void;
    error?: string;
    estimatedTime?: number;
    wasSummarized?: boolean;
    originalTokenCount?: number;
    finalTokenCount?: number;
}
/**
 * Generation progress component showing steps and cancel button
 * Implements FR-026, FR-026a
 */
export declare const GenerationProgress: React.FC<GenerationProgressProps>;
export {};
//# sourceMappingURL=GenerationProgress.d.ts.map