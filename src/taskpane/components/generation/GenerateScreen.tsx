/**
 * GenerateScreen component - Prompt selection and AI generation for compose mode
 * Features:
 * - List of available prompts
 * - One-click generation
 * - Progress overlay during generation
 * - Error handling with retry
 */

import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  shorthands,
  Text,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import { Send24Regular, Settings24Regular, Add24Regular } from '@fluentui/react-icons';
import { usePrompts } from '../../hooks/usePrompts';
import { useSettings } from '../../hooks/useSettings';
import { useGeneration } from '../../hooks/useGeneration';
import { Prompt } from '../../../models/Prompt';
import { GenerationOverlay } from './GenerationOverlay';
import { ErrorBanner } from './ErrorBanner';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
  },
  header: {
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
  promptList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    flexGrow: 1,
    overflowY: 'auto',
  },
  promptItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  promptTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    textAlign: 'center',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  emptyText: {
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

interface GenerateScreenProps {
  onOpenSettings?: () => void;
  onAddPrompt?: () => void;
}

export const GenerateScreen: React.FC<GenerateScreenProps> = ({ onOpenSettings, onAddPrompt }) => {
  const styles = useStyles();
  const { prompts, loading: promptsLoading } = usePrompts();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { isGenerating, currentStep, error, generate, cancel, clearError } = useGeneration();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const handleSelectPrompt = async (prompt: Prompt) => {
    if (!settings?.apiKey) {
      return;
    }

    setSelectedPrompt(prompt);
    await generate(prompt.content, settings.apiKey, settings.selectedModel || 'gpt-4');
  };

  const handleRetry = async () => {
    if (selectedPrompt && settings?.apiKey) {
      clearError();
      await generate(selectedPrompt.content, settings.apiKey, settings.selectedModel || 'gpt-4');
    }
  };

  if (promptsLoading || settingsLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  // No API key configured
  if (!settings?.apiKey) {
    return (
      <div className={styles.container}>
        <MessageBar intent="warning">
          <MessageBarBody>
            <MessageBarTitle>API Key Required</MessageBarTitle>
            Please configure your ChatGPT API key in settings before generating responses.
          </MessageBarBody>
        </MessageBar>
        {onOpenSettings && (
          <div className={styles.footer}>
            <Button appearance="primary" icon={<Settings24Regular />} onClick={onOpenSettings}>
              Open Settings
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>AI Reply</Text>
        <Text className={styles.subtitle}>Select a prompt to generate an AI-powered response</Text>
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} onDismiss={clearError} />}

      {prompts.length === 0 ? (
        <div className={styles.emptyState}>
          <Text className={styles.emptyText}>
            No prompts available. Create a prompt to get started.
          </Text>
          {onAddPrompt && (
            <Button appearance="primary" icon={<Add24Regular />} onClick={onAddPrompt}>
              Create Prompt
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.promptList}>
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={styles.promptItem}
              onClick={() => handleSelectPrompt(prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectPrompt(prompt);
                }
              }}
            >
              <Text className={styles.promptTitle}>{prompt.title}</Text>
              <Send24Regular />
            </div>
          ))}
        </div>
      )}

      {prompts.length > 0 && onAddPrompt && (
        <div className={styles.footer}>
          <Button appearance="secondary" icon={<Add24Regular />} onClick={onAddPrompt}>
            Add Prompt
          </Button>
        </div>
      )}

      <GenerationOverlay
        isOpen={isGenerating}
        currentStep={currentStep}
        onCancel={cancel}
        error={error || undefined}
      />
    </div>
  );
};
