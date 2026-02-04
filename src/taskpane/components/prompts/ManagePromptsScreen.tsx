import React, { useEffect, useState } from 'react';
import {
  Button,
  makeStyles,
  tokens,
  Title3,
  Body1,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import { Add24Regular } from '@fluentui/react-icons';
import { usePrompts } from '../../hooks/usePrompts';
import { Prompt } from '../../../models/Prompt';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
  },
  promptList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    overflowY: 'auto',
    flex: 1,
  },
  promptCard: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3,
  },
});

export interface ManagePromptsScreenProps {
  onEditPrompt: (promptId: string) => void;
  onAddPrompt: () => void;
}

export const ManagePromptsScreen: React.FC<ManagePromptsScreenProps> = ({
  onEditPrompt,
  onAddPrompt,
}) => {
  const styles = useStyles();
  const { prompts } = usePrompts();
  const [sortedPrompts, setSortedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Sort alphabetically by title (FR-047)
    const sorted = [...prompts].sort((a: Prompt, b: Prompt): number =>
      a.title.localeCompare(b.title)
    );
    setSortedPrompts(sorted);
  }, [prompts]);

  const handlePromptClick = (promptId: string): void => {
    onEditPrompt(promptId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>Manage Prompts</Title3>
        <Button appearance="primary" icon={<Add24Regular />} onClick={onAddPrompt}>
          Add New Prompt
        </Button>
      </div>

      <div className={styles.promptList}>
        {sortedPrompts.length === 0 ? (
          <Button appearance="primary" icon={<Add24Regular />} onClick={onAddPrompt}>
            Add New Prompt
          </Button>
        ) : (
          sortedPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className={styles.promptCard}
              onClick={(): void => handlePromptClick(prompt.id)}
            >
              <CardHeader
                header={
                  <Body1>
                    <strong>{prompt.title}</strong>
                  </Body1>
                }
                description={
                  <Body1>
                    {prompt.content.length > 100
                      ? `${prompt.content.substring(0, 100)}...`
                      : prompt.content}
                  </Body1>
                }
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagePromptsScreen;
