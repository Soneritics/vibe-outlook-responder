import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import { GenerationOverlay } from './GenerationOverlay';
import { ErrorBanner } from './ErrorBanner';
import { useGeneration } from '../../hooks/useGeneration';
import { useSettings } from '../../hooks/useSettings';
import { usePrompts } from '../../hooks/usePrompts';
import { Prompt } from '../../../models/Prompt';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
});

interface GenerationPanelProps {
  promptId: string;
}

/**
 * Generation panel component that handles the AI generation flow
 * Shown in taskpane when generation is triggered from compose mode
 * Implements FR-024 through FR-029d
 */
export const GenerationPanel: React.FC<GenerationPanelProps> = ({ promptId }) => {
  const styles = useStyles();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { settings, isLoading: settingsLoading } = useSettings();
  const { prompts, isLoading: promptsLoading } = usePrompts();
  const { isGenerating, currentStep, error, generate, cancel, retry } = useGeneration();

  useEffect(() => {
    // Find the prompt by ID
    if (!promptsLoading && prompts.length > 0) {
      const foundPrompt = prompts.find((p) => p.id === promptId);
      if (foundPrompt) {
        setPrompt(foundPrompt);
        setIsLoading(false);

        // Auto-start generation if we have settings
        if (settings?.apiKey && !settingsLoading) {
          startGeneration(foundPrompt);
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [promptId, prompts, promptsLoading, settings, settingsLoading]);

  const startGeneration = async (selectedPrompt: Prompt) => {
    if (!settings?.apiKey) {
      // Will be caught by error state
      return;
    }

    await generate(selectedPrompt.content, settings.apiKey, settings.selectedModel || 'gpt-4');
  };

  if (isLoading || settingsLoading || promptsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spinner size="small" />
          <Text>Loading...</Text>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className={styles.container}>
        <MessageBar intent="error">
          <MessageBarBody>
            <Text>Prompt not found. Please select a valid prompt.</Text>
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  if (!settings?.apiKey) {
    return (
      <div className={styles.container}>
        <MessageBar intent="warning">
          <MessageBarBody>
            <Text>
              No API key configured. Please configure your API key in settings before generating
              responses.
            </Text>
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => startGeneration(prompt)}
          onDismiss={() => window.close()}
        />
      )}

      <GenerationOverlay
        isOpen={isGenerating || error !== null}
        currentStep={currentStep}
        onCancel={cancel}
        error={error || undefined}
      />

      {!isGenerating && !error && (
        <MessageBar intent="success">
          <MessageBarBody>
            <Text>AI response generated successfully! You can now edit or send your email.</Text>
          </MessageBarBody>
        </MessageBar>
      )}
    </div>
  );
};
