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
    if (!id && event.source && (event.source as { id?: string }).id) {
      id = (event.source as { id?: string }).id;
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
 * Triggered from compose mode dropdown (FR-023, FR-024)
 * @param promptId - ID of the prompt to use (from event source)
 */
export function generateResponse(event: Office.AddinCommands.Event, promptId?: string): void {
  try {
    // Get promptId from event source if not provided
    let id = promptId;
    if (!id && event.source && (event.source as { id?: string }).id) {
      id = (event.source as { id?: string }).id;
    }

    if (!id) {
      console.error('No prompt ID provided for generation');
      event.completed();
      return;
    }

    // Open generation overlay taskpane
    Office.context.ui.displayDialogAsync(
      `${window.location.origin}/taskpane.html?panel=generation&promptId=${encodeURIComponent(id)}`,
      { height: 50, width: 35, displayInIframe: true },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error('Failed to open generation overlay:', result.error);
        }
      }
    );

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
