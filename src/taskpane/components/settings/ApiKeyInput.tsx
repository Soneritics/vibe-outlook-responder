import React, { useState } from 'react';
import {
  Field,
  Input as FluentInput,
  Button,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Eye20Regular, EyeOff20Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  inputWrapper: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'flex-start',
  },
  input: {
    flexGrow: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  successMessage: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

export interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  onTestConnection: () => void;
  error?: string;
  isTestingConnection?: boolean;
  testConnectionResult?: {
    success: boolean;
    message: string;
  };
}

/**
 * Component for API key input with masking and test connection functionality
 */
export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  onTestConnection,
  error,
  isTestingConnection = false,
  testConnectionResult,
}) => {
  const styles = useStyles();
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const isApiKeyEmpty = !value || value.trim().length === 0;

  return (
    <div className={styles.container}>
      <Field
        label="API Key"
        validationMessage={error}
        validationState={error ? 'error' : undefined}
      >
        <div className={styles.inputWrapper}>
          <FluentInput
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={handleInputChange}
            placeholder="sk-..."
            className={styles.input}
            aria-label="API Key"
            aria-invalid={!!error}
          />
          <div className={styles.buttonGroup}>
            <Button
              appearance="subtle"
              icon={isVisible ? <EyeOff20Regular /> : <Eye20Regular />}
              onClick={toggleVisibility}
              aria-label={isVisible ? 'Hide API key' : 'Show API key'}
              title={isVisible ? 'Hide' : 'Show'}
            />
            <Button
              appearance="primary"
              onClick={onTestConnection}
              disabled={isApiKeyEmpty || isTestingConnection}
              aria-label="Test Connection"
            >
              {isTestingConnection ? (
                <>
                  <Spinner size="tiny" /> Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>
        </div>
      </Field>

      {testConnectionResult && (
        <div
          className={
            testConnectionResult.success ? styles.successMessage : styles.errorMessage
          }
          role="alert"
        >
          {testConnectionResult.message}
        </div>
      )}
    </div>
  );
};
