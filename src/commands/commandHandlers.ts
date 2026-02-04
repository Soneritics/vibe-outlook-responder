/* global Office */

/**
 * Command handlers for Outlook ribbon buttons
 */

/**
 * Opens the Settings panel in a taskpane
 */
export function openSettings(event: Office.AddinCommands.Event): void {
  try {
    // Open taskpane with settings
    Office.context.ui.displayDialogAsync(
      `${window.location.origin}/taskpane.html?panel=settings`,
      { height: 60, width: 40 },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error('Failed to open settings:', result.error);
        }
      }
    );

    // Signal that the command is complete
    event.completed();
  } catch (error) {
    console.error('Error opening settings:', error);
    event.completed();
  }
}

/**
 * Opens the Add Custom Prompt panel
 */
export function openAddPrompt(event: Office.AddinCommands.Event): void {
  try {
    // Open taskpane with prompt editor
    Office.context.ui.displayDialogAsync(
      `${window.location.origin}/taskpane.html?panel=prompt-editor`,
      { height: 60, width: 40 },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error('Failed to open prompt editor:', result.error);
        }
      }
    );

    event.completed();
  } catch (error) {
    console.error('Error opening prompt editor:', error);
    event.completed();
  }
}

/**
 * Opens the prompt editor in edit mode for a specific prompt
 * @param promptId - The ID of the prompt to edit
 */
export function openEditPrompt(event: Office.AddinCommands.Event, promptId?: string): void {
  try {
    // Get promptId from event item if not provided
    let id = promptId;
    if (!id && event.source && (event.source as any).id) {
      id = (event.source as any).id;
    }

    if (!id) {
      console.error('No prompt ID provided for edit');
      event.completed();
      return;
    }

    // Open taskpane with prompt editor in edit mode
    Office.context.ui.displayDialogAsync(
      `${window.location.origin}/taskpane.html?panel=prompt-editor&promptId=${encodeURIComponent(id)}`,
      { height: 60, width: 40 },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error('Failed to open prompt editor:', result.error);
        }
      }
    );

    event.completed();
  } catch (error) {
    console.error('Error opening prompt editor:', error);
    event.completed();
  }
}

/**
 * Generates AI response using selected prompt
 */
export function generateResponse(event: Office.AddinCommands.Event): void {
  try {
    // For now, just log - will be implemented in Phase 6
    console.log('Generate response command triggered');
    event.completed();
  } catch (error) {
    console.error('Error generating response:', error);
    event.completed();
  }
}

// Register command handlers
Office.actions.associate('openSettings', openSettings);
Office.actions.associate('openAddPrompt', openAddPrompt);
Office.actions.associate('openEditPrompt', openEditPrompt);
Office.actions.associate('generateResponse', generateResponse);
