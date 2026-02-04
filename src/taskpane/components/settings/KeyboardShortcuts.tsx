import React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Label,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import { Keyboard20Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  card: {
    padding: tokens.spacingHorizontalM,
  },
  shortcutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} 0`,
  },
  shortcutLabel: {
    flex: 1,
  },
  shortcutKey: {
    fontFamily: 'monospace',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  description: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
});

interface KeyboardShortcutsProps {
  shortcuts?: Record<string, string>;
}

/**
 * Keyboard shortcuts display component
 * Shows configured keyboard shortcuts for the add-in
 * Currently read-only - future versions will allow customization
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  shortcuts = {},
}) => {
  const styles = useStyles();

  // Default shortcuts (Office Add-ins have limited keyboard shortcut support)
  const defaultShortcuts = [
    {
      action: 'Open Prompt Dropdown',
      keys: shortcuts['openPromptDropdown'] || 'Not configured',
      description: 'Quick access to prompt selection',
    },
    {
      action: 'Focus Settings',
      keys: shortcuts['openSettings'] || 'Alt + S',
      description: 'Open settings panel',
    },
  ];

  return (
    <div className={styles.container}>
      <Label size="large">
        <Keyboard20Regular /> Keyboard Shortcuts
      </Label>
      
      <Text className={styles.description}>
        Keyboard shortcuts for quick access to common actions. Office Add-ins have limited
        keyboard shortcut customization support.
      </Text>

      <Card className={styles.card}>
        <CardHeader
          header={<Text weight="semibold">Available Shortcuts</Text>}
        />
        
        {defaultShortcuts.map((shortcut, index) => (
          <div key={index} className={styles.shortcutRow}>
            <div className={styles.shortcutLabel}>
              <Text>{shortcut.action}</Text>
              <Text size={200} className={styles.description}>
                {shortcut.description}
              </Text>
            </div>
            <Text className={styles.shortcutKey}>{shortcut.keys}</Text>
          </div>
        ))}
      </Card>

      <Text size={200} className={styles.description}>
        Note: Keyboard shortcuts in Office Add-ins are platform-specific and may not work
        in all environments (Desktop, Web, Mobile).
      </Text>
    </div>
  );
};
