import React, { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Title3,
  Button,
  Divider,
  Spinner,
  Text,
} from '@fluentui/react-components';
import { Save20Regular, Delete20Regular } from '@fluentui/react-icons';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelector } from './ModelSelector';
import { ExportImport } from './ExportImport';
import { useSettings } from '../../hooks/useSettings';
import { usePrompts } from '../../hooks/usePrompts';
import { validateApiKeyFormat } from '../../../services/validation/ApiKeyValidator';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Prompt } from '../../../models/Prompt';
import { SupportedModel } from '../../../models/Settings';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalL,
    height: '100%',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  buttonGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  successMessage: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  dangerZone: {
    marginTop: tokens.spacingVerticalL,
    paddingTop: tokens.spacingVerticalL,
  },
});

/**
 * Settings panel component for managing API key and model preferences
 */
export const SettingsPanel: React.FC = () => {
  const styles = useStyles();
  const { settings, isLoading, updateSettings, resetSettings } = useSettings();
  const { prompts, createPrompt, deletePrompt } = usePrompts();

  const [localApiKey, setLocalApiKey] = useState('');
  const [localModel, setLocalModel] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | undefined>(
    undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Initialize local state when settings load
  React.useEffect(() => {
    if (!isLoading) {
      setLocalApiKey(settings.apiKey);
      setLocalModel(settings.selectedModel);
    }
  }, [settings, isLoading]);

  const handleApiKeyChange = (value: string) => {
    setLocalApiKey(value);
    setApiKeyError('');
    setTestResult(undefined);
    setSaveMessage('');
  };

  const handleModelChange = (value: string) => {
    setLocalModel(value);
    setSaveMessage('');
  };

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(undefined);
    setApiKeyError('');

    try {
      // Validate API key format
      const validation = validateApiKeyFormat(localApiKey);

      if (!validation.isValid) {
        setApiKeyError(validation.error || 'Invalid API key format');
        setTestResult({
          success: false,
          message: 'Invalid API key format. Must start with "sk-"',
        });
        return;
      }

      // Test connection to OpenAI API
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localApiKey}`,
        },
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Connection successful! Your API key is valid.',
        });
      } else if (response.status === 401) {
        setTestResult({
          success: false,
          message: 'Invalid or expired API key. Please check your key.',
        });
      } else {
        setTestResult({
          success: false,
          message: `Connection failed with status ${response.status}. Please try again.`,
        });
      }
    } catch (_error) {
      setTestResult({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsTesting(false);
    }
  }, [localApiKey]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setApiKeyError('');

    try {
      // Validate API key if provided
      if (localApiKey.trim()) {
        const validation = validateApiKeyFormat(localApiKey);

        if (!validation.isValid) {
          setApiKeyError(validation.error || 'Invalid API key format');
          setIsSaving(false);
          return;
        }
      }

      // Save settings
      await updateSettings({
        apiKey: localApiKey,
        selectedModel: localModel as SupportedModel,
      });

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (_error) {
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      // Also delete all prompts
      for (const prompt of prompts) {
        await deletePrompt(prompt.id);
      }
      setLocalApiKey('');
      setLocalModel('gpt-4o');
      setApiKeyError('');
      setTestResult(undefined);
      setSaveMessage('All settings and prompts have been reset.');
      setShowResetDialog(false);
    } catch (_error) {
      setSaveMessage('Failed to reset settings. Please try again.');
    }
  };

  const handleImportPrompts = async (importedPrompts: Prompt[]) => {
    try {
      // Create each imported prompt
      for (const prompt of importedPrompts) {
        await createPrompt({ title: prompt.title, content: prompt.content });
      }
    } catch (_error) {
      throw new Error('Failed to import prompts');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>Settings</Title3>
        <Text>Configure your ChatGPT API key and model preferences</Text>
      </div>

      <Divider />

      <div className={styles.section}>
        <ApiKeyInput
          value={localApiKey}
          onChange={handleApiKeyChange}
          onTestConnection={handleTestConnection}
          error={apiKeyError}
          isTestingConnection={isTesting}
          testConnectionResult={testResult}
        />

        <ModelSelector value={localModel} onChange={handleModelChange} disabled={isSaving} />
      </div>

      <Divider />

      <div className={styles.section}>
        <ExportImport prompts={prompts} onImport={handleImportPrompts} />
      </div>

      <div className={styles.buttonGroup}>
        <Button
          appearance="primary"
          icon={<Save20Regular />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {saveMessage && (
        <Text
          className={saveMessage.includes('success') ? styles.successMessage : styles.errorMessage}
          role="alert"
        >
          {saveMessage}
        </Text>
      )}

      <div className={styles.dangerZone}>
        <Divider />
        <Title3>Danger Zone</Title3>
        <Text>Reset all settings and delete all prompts. This action cannot be undone.</Text>
        <Button
          appearance="subtle"
          icon={<Delete20Regular />}
          onClick={() => setShowResetDialog(true)}
          style={{ marginTop: tokens.spacingVerticalS }}
        >
          Reset All Data
        </Button>
      </div>

      <ConfirmDialog
        open={showResetDialog}
        title="Reset All Data?"
        message="This will clear your API key, model preference, all prompts, and all other settings. This action cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};
