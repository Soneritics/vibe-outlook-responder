import React from 'react';
import {
  Field,
  Dropdown as FluentDropdown,
  Option,
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXXS,
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  optionTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  optionDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
});

export interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Default)',
    description: 'Latest and most capable model with enhanced reasoning',
    contextWindow: '128K tokens',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Faster and more affordable with excellent performance',
    contextWindow: '128K tokens',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'High-quality responses with strong reasoning',
    contextWindow: '8K tokens',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for simpler tasks',
    contextWindow: '16K tokens',
  },
];

/**
 * Component for selecting the ChatGPT model
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const styles = useStyles();

  const selectedModel = value || 'gpt-4o';
  const selectedModelInfo = MODEL_OPTIONS.find(m => m.id === selectedModel);

  const handleChange = (_event: any, data: any) => {
    if (data.optionValue) {
      onChange(data.optionValue);
    }
  };

  return (
    <div className={styles.container}>
      <Field label="Model">
        <FluentDropdown
          value={selectedModelInfo?.name || ''}
          selectedOptions={[selectedModel]}
          onOptionSelect={handleChange}
          disabled={disabled}
          aria-label="Select ChatGPT model"
        >
          {MODEL_OPTIONS.map(model => (
            <Option key={model.id} value={model.id} text={model.name}>
              <div className={styles.optionContent}>
                <Text className={styles.optionTitle}>{model.name}</Text>
                <Text className={styles.optionDescription}>
                  {model.description} • {model.contextWindow}
                </Text>
              </div>
            </Option>
          ))}
        </FluentDropdown>
      </Field>

      {selectedModelInfo && (
        <Text className={styles.description}>
          {selectedModelInfo.description} • Context: {selectedModelInfo.contextWindow}
        </Text>
      )}
    </div>
  );
};
