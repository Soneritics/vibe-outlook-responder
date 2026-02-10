/**
 * PromptDropdown component - Dropdown selector for prompts
 * Features:
 * - Alphabetically sorted prompts
 * - Custom actions (Add Custom Prompt, Settings)
 * - Loading state
 * - Empty state
 */

import React from 'react';
import {
  Dropdown,
  Option,
  OptionGroup,
  makeStyles,
  tokens,
  shorthands,
  Spinner,
} from '@fluentui/react-components';
import { Prompt } from '../../../models/Prompt';

const useStyles = makeStyles({
  dropdown: {
    width: '100%',
  },
  emptyState: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
  loading: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
});

interface PromptDropdownProps {
  prompts: Prompt[];
  loading?: boolean;
  selectedPromptId?: string | null;
  onPromptSelect?: (promptId: string) => void;
  onAddCustomPrompt?: () => void;
  onSettings?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showActions?: boolean; // Show Add Custom Prompt, Settings options
}

export const PromptDropdown: React.FC<PromptDropdownProps> = ({
  prompts,
  loading = false,
  selectedPromptId,
  onPromptSelect,
  onAddCustomPrompt,
  onSettings,
  placeholder = 'Select a prompt',
  disabled = false,
  showActions = true,
}) => {
  const styles = useStyles();

  const handleOptionSelect = (_event: unknown, data: { optionValue?: string }) => {
    const value = data.optionValue;

    if (value === '__add_custom__' && onAddCustomPrompt) {
      onAddCustomPrompt();
    } else if (value === '__settings__' && onSettings) {
      onSettings();
    } else if (onPromptSelect && value) {
      onPromptSelect(value);
    }
  };

  const getSelectedValue = (): string => {
    if (selectedPromptId) {
      const prompt = prompts.find((p) => p.id === selectedPromptId);
      return prompt?.title || '';
    }
    return '';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner size="tiny" />
        <span>Loading prompts...</span>
      </div>
    );
  }

  return (
    <Dropdown
      className={styles.dropdown}
      placeholder={placeholder}
      value={getSelectedValue()}
      onOptionSelect={handleOptionSelect}
      disabled={disabled}
    >
      {prompts.length === 0 && !showActions && (
        <div className={styles.emptyState}>No prompts available</div>
      )}

      {/* Prompts Group */}
      {prompts.length > 0 && (
        <OptionGroup label="Prompts">
          {prompts.map((prompt) => (
            <Option key={prompt.id} value={prompt.id} text={prompt.title}>
              {prompt.title}
            </Option>
          ))}
        </OptionGroup>
      )}

      {/* Actions Group */}
      {showActions && (
        <OptionGroup label="Actions">
          {onAddCustomPrompt && (
            <Option value="__add_custom__" text="Add Custom Prompt">
              + Add Custom Prompt
            </Option>
          )}
          {onSettings && (
            <Option value="__settings__" text="Settings">
              ⚙️ Settings
            </Option>
          )}
        </OptionGroup>
      )}
    </Dropdown>
  );
};
