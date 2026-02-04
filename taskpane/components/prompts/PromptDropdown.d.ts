/**
 * PromptDropdown component - Dropdown selector for prompts
 * Features:
 * - Alphabetically sorted prompts
 * - Custom actions (Add Custom Prompt, Settings)
 * - Loading state
 * - Empty state
 */
import React from 'react';
import { Prompt } from '../../../models/Prompt';
interface PromptDropdownProps {
    prompts: Prompt[];
    loading?: boolean;
    selectedPromptId?: string | null;
    onPromptSelect?: (promptId: string) => void;
    onAddCustomPrompt?: () => void;
    onSettings?: () => void;
    placeholder?: string;
    disabled?: boolean;
    showActions?: boolean;
}
export declare const PromptDropdown: React.FC<PromptDropdownProps>;
export {};
//# sourceMappingURL=PromptDropdown.d.ts.map