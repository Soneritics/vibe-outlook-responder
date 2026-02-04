import React from 'react';
/**
 * Represents a single step in the progress flow
 */
export interface ProgressStep {
    /**
     * Unique identifier for the step
     */
    id: string;
    /**
     * Display label for the step
     */
    label: string;
}
/**
 * Props for the ProgressBar component
 */
export interface ProgressBarProps {
    /**
     * List of steps in the progress flow
     */
    steps: ProgressStep[];
    /**
     * Current active step (by ID)
     */
    currentStep: string;
    /**
     * Optional error message to display
     */
    error?: string;
}
/**
 * Progress bar component with step indicators
 * Used during AI generation: Preparing → Sending → Generating → Done
 */
export declare const ProgressBar: React.FC<ProgressBarProps>;
//# sourceMappingURL=ProgressBar.d.ts.map