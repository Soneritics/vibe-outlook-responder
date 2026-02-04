import React from 'react';
import { makeStyles, tokens, Dialog, DialogSurface, DialogBody } from '@fluentui/react-components';
import { GenerationProgress, GenerationStep } from './GenerationProgress';

const useStyles = makeStyles({
  dialogSurface: {
    minWidth: '400px',
    maxWidth: '600px',
  },
  dialogBody: {
    padding: tokens.spacingVerticalL,
  },
});

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
export const GenerationOverlay: React.FC<GenerationOverlayProps> = ({
  isOpen,
  currentStep,
  onCancel,
  error,
  estimatedTime,
}) => {
  const styles = useStyles();

  return (
    <Dialog open={isOpen} modalType="modal">
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody className={styles.dialogBody}>
          <GenerationProgress
            currentStep={currentStep}
            onCancel={onCancel}
            error={error}
            estimatedTime={estimatedTime}
          />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
