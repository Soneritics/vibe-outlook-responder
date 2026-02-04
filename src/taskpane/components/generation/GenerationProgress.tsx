import React, { useState, useEffect } from 'react';
import {
  ProgressBar,
  Button,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
  },
  activeStep: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    fontWeight: tokens.fontWeightSemibold,
  },
  completedStep: {
    color: tokens.colorNeutralForeground3,
  },
  progressBar: {
    width: '100%',
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalM,
  },
  timeEstimate: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
});

export type GenerationStep = 'preparing' | 'sending' | 'generating' | 'done';

interface GenerationProgressProps {
  currentStep: GenerationStep;
  onCancel: () => void;
  error?: string;
  estimatedTime?: number;
}

/**
 * Generation progress component showing steps and cancel button
 * Implements FR-026, FR-026a
 */
export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  currentStep,
  onCancel,
  error,
  estimatedTime,
}) => {
  const styles = useStyles();
  const [cancelDisabled, setCancelDisabled] = useState(false);

  const steps: Array<{ id: GenerationStep; label: string }> = [
    { id: 'preparing', label: 'Preparing request' },
    { id: 'sending', label: 'Sending to ChatGPT' },
    { id: 'generating', label: 'Generating response' },
    { id: 'done', label: 'Complete' },
  ];

  const stepIndex = steps.findIndex((step) => step.id === currentStep);
  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  const handleCancel = () => {
    setCancelDisabled(true);
    onCancel();
  };

  const getStepClass = (stepId: GenerationStep): string => {
    const baseClass = styles.step;
    if (stepId === currentStep) {
      return `${baseClass} ${styles.activeStep}`;
    }
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    const thisIndex = steps.findIndex((s) => s.id === stepId);
    if (thisIndex < currentIndex) {
      return `${baseClass} ${styles.completedStep}`;
    }
    return baseClass;
  };

  const showCancel = currentStep !== 'done' && !error;

  return (
    <div className={styles.container}>
      {/* Progress bar */}
      <ProgressBar
        className={styles.progressBar}
        value={progressValue}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Generation progress"
      />

      {/* Steps */}
      <div className={styles.stepContainer}>
        {steps.map((step) => (
          <div key={step.id} className={getStepClass(step.id)}>
            {step.id === currentStep && !error && (
              <Spinner size="tiny" role="status" aria-label="Loading" />
            )}
            <Text>{step.label}</Text>
            {step.id === currentStep && estimatedTime && (
              <Text className={styles.timeEstimate}>
                (~{estimatedTime} seconds)
              </Text>
            )}
          </div>
        ))}
      </div>

      {/* Progress percentage */}
      <Text weight="semibold">{Math.round(progressValue)}% complete</Text>

      {/* Error message */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          <Text>{error}</Text>
        </div>
      )}

      {/* Cancel button */}
      {showCancel && (
        <div className={styles.actions}>
          <Button
            appearance="secondary"
            icon={<Dismiss24Regular />}
            onClick={handleCancel}
            disabled={cancelDisabled}
            aria-label="Cancel generation"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
