import React from 'react';
import { GenerationStep } from './GenerationProgress';
interface GenerationOverlayProps {
    isOpen: boolean;
    currentStep: GenerationStep;
    onCancel: () => void;
    error?: string;
    estimatedTime?: number;
}
/**
 * Generation overlay that displays progress during AI generation
 * Implements FR-026
 */
export declare const GenerationOverlay: React.FC<GenerationOverlayProps>;
export {};
//# sourceMappingURL=GenerationOverlay.d.ts.map