import React from 'react';
import { Button as FluentButton } from '@fluentui/react-components';

/**
 * Props for the Button component
 */
export interface ButtonProps {
  /**
   * Button label text
   */
  children: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Button appearance variant
   * @default 'primary'
   */
  appearance?: 'primary' | 'secondary' | 'subtle' | 'transparent';

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Button type for form submission
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Reusable button component using Fluent UI React 9
 * Provides consistent styling across the add-in
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  appearance = 'primary',
  type = 'button',
  onClick,
  disabled,
}) => {
  return (
    <FluentButton appearance={appearance} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </FluentButton>
  );
};
