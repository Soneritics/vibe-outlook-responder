import React from 'react';
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
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map