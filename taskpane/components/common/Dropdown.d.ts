import React from 'react';
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
export declare const Dropdown: React.FC<DropdownProps>;
//# sourceMappingURL=Dropdown.d.ts.map