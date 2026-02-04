/**
 * PromptEditor component - Create/edit prompt interface
 * Features:
 * - Title input (max 100 characters)
 * - Content textarea (max 10,000 characters)
 * - Unique title validation
 * - Character counters
 * - Delete with confirmation (edit mode only)
 */
import React from 'react';
import { Prompt } from '../../../models/Prompt';
interface PromptEditorProps {
    prompt?: Prompt;
    onSave: (data: {
        title: string;
        content: string;
    }) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => Promise<void>;
    onBack?: () => void;
}
export declare const PromptEditor: React.FC<PromptEditorProps>;
export {};
//# sourceMappingURL=PromptEditor.d.ts.map