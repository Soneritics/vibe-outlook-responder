import React from 'react';
import {
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular, ArrowClockwiseRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    marginBottom: tokens.spacingVerticalM,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
});

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Error banner component for displaying generation errors
 * Implements FR-027, FR-027a
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onDismiss }) => {
  const styles = useStyles();

  return (
    <MessageBar intent="error" className={styles.container}>
      <MessageBarBody>
        <MessageBarTitle>Error</MessageBarTitle>
        {message}
        <div className={styles.actions}>
          {onRetry && (
            <Button
              appearance="primary"
              size="small"
              icon={<ArrowClockwiseRegular />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              appearance="secondary"
              size="small"
              icon={<DismissRegular />}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </MessageBarBody>
    </MessageBar>
  );
};
