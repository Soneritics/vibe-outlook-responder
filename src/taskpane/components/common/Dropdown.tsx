import React from 'react';
import {
  Dropdown as FluentDropdown,
  Option,
  Field,
} from '@fluentui/react-components';

/**
 * Single dropdown option
 */
export interface DropdownOption {
  /**
   * Option value (internal ID)
   */
  value: string;

  /**
   * Display text for the option
   */
  label: string;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the Dropdown component
 */
export interface DropdownProps {
  /**
   * Dropdown field label
   */
  label: string;

  /**
   * Available options
   */
  options: DropdownOption[];

  /**
   * Currently selected value
   */
  value: string;

  /**
   * Change handler - called when selection changes
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Validation error message to display
   */
  error?: string;
}

/**
 * Reusable dropdown component using Fluent UI React 9
 * Provides consistent selection UI across the add-in
 */
export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => {
  const handleChange = (_: unknown, data: { optionValue?: string }): void => {
    if (data.optionValue) {
      onChange(data.optionValue);
    }
  };

  return (
    <Field
      label={label}
      required={required}
      validationMessage={error}
      validationState={error ? 'error' : undefined}
    >
      <FluentDropdown
        value={value}
        onOptionSelect={handleChange}
        placeholder={placeholder}
      >
        {options.map((option) => (
          <Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </Option>
        ))}
      </FluentDropdown>
    </Field>
  );
};
