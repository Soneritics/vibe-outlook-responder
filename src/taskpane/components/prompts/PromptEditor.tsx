/**
 * PromptEditor component - Create/edit prompt interface
 * Features:
 * - Title input (max 100 characters)
 * - Content textarea (max 10,000 characters)
 * - Unique title validation
 * - Character counters
 * - Delete with confirmation (edit mode only)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { Delete24Regular, Save24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { Prompt } from '../../../models/Prompt';
import { ConfirmDialog } from '../common/ConfirmDialog';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    height: '100%',
    boxSizing: 'border-box',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  charCounter: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  charCounterWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  charCounterError: {
    color: tokens.colorPaletteRedForeground1,
  },
  textarea: {
    minHeight: '300px',
    resize: 'vertical',
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  buttonGroup: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginTop: 'auto',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
});

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (data: { title: string; content: string }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 10000;
const CHAR_WARNING_THRESHOLD = 0.95; // Show warning at 95% capacity

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onCancel, onDelete }) => {
  const styles = useStyles();
  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!prompt;

  // Update form fields when prompt prop changes (for edit mode)
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [prompt]);

  // Clear error when title changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [title, content]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CONTENT_LENGTH) {
      setContent(value);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError('Both title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({ title: trimmedTitle, content: trimmedContent });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [title, content, onSave]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    try {
      setSaving(true);
      setError(null);
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setSaving(false);
    }
  }, [onDelete]);

  const isSaveDisabled = !title.trim() || !content.trim() || saving;

  const getTitleCharCounterClass = (): string => {
    const ratio = title.length / MAX_TITLE_LENGTH;
    if (ratio >= 1) return styles.charCounterError;
    if (ratio >= CHAR_WARNING_THRESHOLD) return styles.charCounterWarning;
    return styles.charCounter;
  };

  const getContentCharCounterClass = (): string => {
    const ratio = content.length / MAX_CONTENT_LENGTH;
    if (ratio >= 1) return styles.charCounterError;
    if (ratio >= CHAR_WARNING_THRESHOLD) return styles.charCounterWarning;
    return styles.charCounter;
  };

  return (
    <div className={styles.container}>
      <div className={styles.formField}>
        <Label htmlFor="prompt-title" required>
          Title
        </Label>
        <Input
          id="prompt-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter prompt title"
          maxLength={MAX_TITLE_LENGTH}
          aria-required="true"
          disabled={saving}
        />
        <Text className={getTitleCharCounterClass()}>
          {title.length} / {MAX_TITLE_LENGTH.toLocaleString()}
        </Text>
      </div>

      <div className={styles.formField}>
        <Label htmlFor="prompt-content" required>
          Content
        </Label>
        <Textarea
          id="prompt-content"
          value={content}
          onChange={handleContentChange}
          placeholder="Enter prompt content"
          className={styles.textarea}
          maxLength={MAX_CONTENT_LENGTH}
          aria-required="true"
          disabled={saving}
        />
        <Text className={getContentCharCounterClass()}>
          {content.length} / {MAX_CONTENT_LENGTH.toLocaleString()}
        </Text>
      </div>

      {error && (
        <Text role="alert" className={styles.errorMessage}>
          {error}
        </Text>
      )}

      <div className={styles.buttonGroup}>
        <Button
          appearance="primary"
          icon={<Save24Regular />}
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          Save
        </Button>
        <Button icon={<Dismiss24Regular />} onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        {isEditMode && onDelete && (
          <Button
            appearance="secondary"
            icon={<Delete24Regular />}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={saving}
            className={styles.deleteButton}
          >
            Delete
          </Button>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete Prompt"
          message={`Are you sure you want to delete "${prompt?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmLabel="Delete"
          destructive={true}
        />
      )}
    </div>
  );
};
