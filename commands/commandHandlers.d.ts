/**
 * Command handlers for Outlook ribbon buttons
 */
/**
 * Opens the Settings panel in a taskpane
 */
export declare function openSettings(event: Office.AddinCommands.Event): void;
/**
 * Opens the Add Custom Prompt panel
 */
export declare function openAddPrompt(event: Office.AddinCommands.Event): void;
/**
 * Opens the prompt editor in edit mode for a specific prompt
 * @param promptId - The ID of the prompt to edit
 */
export declare function openEditPrompt(event: Office.AddinCommands.Event, promptId?: string): void;
/**
 * Generates AI response using selected prompt
 * Triggered from compose mode dropdown (FR-023, FR-024)
 * @param promptId - ID of the prompt to use (from event source)
 */
export declare function generateResponse(event: Office.AddinCommands.Event, promptId?: string): void;
//# sourceMappingURL=commandHandlers.d.ts.map