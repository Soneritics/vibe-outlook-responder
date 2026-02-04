import React from 'react';
import {
  Input as FluentInput,
  Field,
} from '@fluentui/react-components';

/**
 * Props for the Input component
 */
export interface InputProps {
  /**
   * Input field label
   */
  label: string;

  /**
   * Input field value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Input type (text, password, email, etc.)
   * @default 'text'
   */
  type?: 'text' | 'password' | 'email' | 'number';

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Validation error message to display
   */
  error?: string;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Reusable input component using Fluent UI React 9
 * Provides validation support and consistent styling
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  placeholder,
  maxLength,
  disabled,
}) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    onChange(event.target.value);
  };

  return (
    <Field
      label={label}
      required={required}
      validationMessage={error}
      validationState={error ? 'error' : undefined}
    >
      <FluentInput
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
      />
    </Field>
  );
};
