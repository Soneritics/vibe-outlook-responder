/**
 * MainScreen component - Main interface for the add-in
 * Features:
 * - Prompt selection dropdown
 * - Quick access to add/edit prompts
 * - Settings access
 */
import React from 'react';
interface MainScreenProps {
    onEditPrompt: (promptId: string) => void;
    onAddPrompt: () => void;
    onSettings: () => void;
}
export declare const MainScreen: React.FC<MainScreenProps>;
export {};
//# sourceMappingURL=MainScreen.d.ts.map