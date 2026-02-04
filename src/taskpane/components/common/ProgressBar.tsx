import React from 'react';
import {
  ProgressBar as FluentProgressBar,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

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

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  stepLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  activeStepLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  errorMessage: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteRedForeground1,
  },
});

/**
 * Progress bar component with step indicators
 * Used during AI generation: Preparing → Sending → Generating → Done
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  error,
}) => {
  const styles = useStyles();
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className={styles.container}>
      <FluentProgressBar value={progress} max={100} />
      <div className={styles.stepLabel}>
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={
              step.id === currentStep
                ? styles.activeStepLabel
                : styles.stepLabel
            }
          >
            {step.label}
            {index < steps.length - 1 && ' → '}
          </span>
        ))}
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};
