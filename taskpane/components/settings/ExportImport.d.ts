import React from 'react';
import { Prompt } from '../../../models/Prompt';
interface ExportImportProps {
    prompts: Prompt[];
    onImport: (prompts: Prompt[]) => Promise<void>;
}
/**
 * Export/Import component for backing up and restoring prompts
 * - Export: Copy all prompts to clipboard as JSON
 * - Import: Read prompts from clipboard JSON and merge with existing
 * - Duplicate handling: Appends "(imported)" to duplicate titles
 */
export declare const ExportImport: React.FC<ExportImportProps>;
export {};
//# sourceMappingURL=ExportImport.d.ts.map