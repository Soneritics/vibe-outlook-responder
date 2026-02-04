import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Label,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import {
  ArrowExport20Regular,
  ArrowImport20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
} from '@fluentui/react-icons';
import { copyToClipboard, readFromClipboard } from '../../../utils/clipboard';
import { Prompt } from '../../../models/Prompt';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  card: {
    padding: tokens.spacingHorizontalM,
  },
  buttonGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  successMessage: {
    color: tokens.colorPaletteGreenForeground1,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
  },
  description: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalS,
  },
});

interface ExportImportProps {
  prompts: Prompt[];
  onImport: (prompts: Prompt[]) => Promise<void>;
}

/**
 * Export/Import component for backing up and restoring prompts
 * - Export: Copy all prompts to clipboard as JSON
 * - Import: Read prompts from clipboard JSON and merge with existing
 * - Duplicate handling: Appends "(imported)" to duplicate titles
 */
export const ExportImport: React.FC<ExportImportProps> = ({ prompts, onImport }) => {
  const styles = useStyles();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      // Convert prompts to JSON
      const json = JSON.stringify(prompts, null, 2);

      // Copy to clipboard
      await copyToClipboard(json);

      setMessage({
        type: 'success',
        text: `Successfully exported ${prompts.length} prompt(s) to clipboard`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsExporting(false);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setMessage(null);

    try {
      // Read from clipboard
      const clipboardText = await readFromClipboard();

      if (!clipboardText) {
        setMessage({
          type: 'error',
          text: 'Clipboard is empty. Please copy valid JSON first.',
        });
        return;
      }

      // Parse JSON
      let importedPrompts: Prompt[];
      try {
        importedPrompts = JSON.parse(clipboardText);
      } catch (_parseError) {
        setMessage({
          type: 'error',
          text: 'Invalid JSON format. Please check clipboard content.',
        });
        return;
      }

      // Validate structure
      if (!Array.isArray(importedPrompts)) {
        setMessage({
          type: 'error',
          text: 'Invalid format: Expected an array of prompts.',
        });
        return;
      }

      // Validate each prompt has required fields
      const isValid = importedPrompts.every(
        (p) => p && typeof p.title === 'string' && typeof p.content === 'string'
      );

      if (!isValid) {
        setMessage({
          type: 'error',
          text: 'Invalid prompt structure. Each prompt must have title and content.',
        });
        return;
      }

      // Handle duplicates by appending "(imported)" to titles
      const existingTitles = new Set(prompts.map((p) => p.title.toLowerCase()));
      const processedPrompts = importedPrompts.map((prompt) => {
        let title = prompt.title;

        // Check if title already exists
        if (existingTitles.has(title.toLowerCase())) {
          title = `${title} (imported)`;

          // If "(imported)" version also exists, add number
          let counter = 1;
          while (existingTitles.has(title.toLowerCase())) {
            title = `${prompt.title} (imported ${counter})`;
            counter++;
          }
        }

        return {
          ...prompt,
          title,
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate new ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      // Import prompts
      await onImport(processedPrompts);

      setMessage({
        type: 'success',
        text: `Successfully imported ${processedPrompts.length} prompt(s)`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsImporting(false);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className={styles.container}>
      <Label size="large">Export/Import Prompts</Label>

      <Text className={styles.description}>
        Backup your prompts by exporting to clipboard, or restore from a previous export.
      </Text>

      <Card className={styles.card}>
        <CardHeader
          header={<Text weight="semibold">Backup & Restore</Text>}
          description={
            <Text size={200}>
              Prompts are saved as JSON format. Import will merge with existing prompts.
            </Text>
          }
        />

        <div className={styles.buttonGroup}>
          <Button
            appearance="secondary"
            icon={<ArrowExport20Regular />}
            onClick={handleExport}
            disabled={isExporting || prompts.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export to Clipboard'}
          </Button>

          <Button
            appearance="secondary"
            icon={<ArrowImport20Regular />}
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import from Clipboard'}
          </Button>
        </div>

        {message && (
          <div
            className={`${styles.message} ${
              message.type === 'success' ? styles.successMessage : styles.errorMessage
            }`}
            role="alert"
          >
            {message.type === 'success' ? <CheckmarkCircle20Regular /> : <DismissCircle20Regular />}
            <Text>{message.text}</Text>
          </div>
        )}
      </Card>

      <Text size={200} className={styles.description}>
        Note: Exported prompts include all content and metadata. Import will preserve your existing
        prompts and append any duplicates with "(imported)".
      </Text>
    </div>
  );
};
