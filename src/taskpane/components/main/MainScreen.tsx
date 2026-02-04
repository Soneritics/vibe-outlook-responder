/**
 * MainScreen component - Main interface for the add-in
 * Features:
 * - Prompt selection dropdown
 * - Quick access to add/edit prompts
 * - Settings access
 */

import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  shorthands,
  Text,
  Button,
} from '@fluentui/react-components';
import { Add24Regular, Settings24Regular } from '@fluentui/react-icons';
import { PromptDropdown } from '../prompts/PromptDropdown';
import { usePrompts } from '../../hooks/usePrompts';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalL),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  sectionLabel: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  buttonGroup: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalM),
    flexWrap: 'wrap',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL),
    ...shorthands.gap(tokens.spacingVerticalL),
    textAlign: 'center',
  },
  emptyStateText: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase400,
  },
});

interface MainScreenProps {
  onEditPrompt: (promptId: string) => void;
  onAddPrompt: () => void;
  onSettings: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onEditPrompt,
  onAddPrompt,
  onSettings,
}) => {
  const styles = useStyles();
  const { prompts, loading } = usePrompts();
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
    // Automatically open the selected prompt for editing
    onEditPrompt(promptId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>AI Responder</Text>
        <Text className={styles.subtitle}>
          Manage your prompts and generate AI-powered email responses
        </Text>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionLabel}>Manage Prompts</Text>
        
        {prompts.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <Text className={styles.emptyStateText}>
              You haven't created any prompts yet.
            </Text>
            <Text className={styles.emptyStateText}>
              Get started by creating your first custom prompt!
            </Text>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={onAddPrompt}
            >
              Create Your First Prompt
            </Button>
          </div>
        ) : (
          <>
            <PromptDropdown
              prompts={prompts}
              loading={loading}
              selectedPromptId={selectedPromptId}
              onPromptSelect={handlePromptSelect}
              onAddCustomPrompt={onAddPrompt}
              onSettings={onSettings}
              placeholder="Select a prompt to edit..."
              showActions={true}
            />
            
            <Text className={styles.emptyStateText}>
              💡 Tip: Select a prompt from the dropdown to edit or delete it
            </Text>
          </>
        )}
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionLabel}>Quick Actions</Text>
        <div className={styles.buttonGroup}>
          <Button
            appearance="secondary"
            icon={<Add24Regular />}
            onClick={onAddPrompt}
          >
            Add Prompt
          </Button>
          <Button
            appearance="secondary"
            icon={<Settings24Regular />}
            onClick={onSettings}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
