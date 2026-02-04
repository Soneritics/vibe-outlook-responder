/**
 * Centralized error message constants for consistent UX
 * All user-facing error messages are defined here for easy localization
 */
/**
 * API Key validation errors
 */
export declare const API_KEY_ERRORS: {
    readonly REQUIRED: "API key is required";
    readonly INVALID_FORMAT: "API key must start with \"sk-\" and be at least 20 characters";
    readonly CONNECTION_FAILED: "Failed to connect to OpenAI. Please check your API key.";
};
/**
 * Prompt validation errors
 */
export declare const PROMPT_ERRORS: {
    readonly TITLE_REQUIRED: "Prompt title is required";
    readonly TITLE_TOO_LONG: "Prompt title must be 100 characters or less";
    readonly TITLE_DUPLICATE: "A prompt with this title already exists";
    readonly CONTENT_REQUIRED: "Prompt content is required";
    readonly CONTENT_TOO_LONG: "Prompt content must be 10,000 characters or less";
};
/**
 * Generation errors
 */
export declare const GENERATION_ERRORS: {
    readonly NO_API_KEY: "Please configure your API key in Settings before generating responses";
    readonly NO_EMAIL_CONTENT: "No email content found to generate a response";
    readonly INVALID_API_KEY: "Invalid or expired API key. Please check your settings.";
    readonly API_UNAVAILABLE: "ChatGPT service is temporarily unavailable. Please try again later.";
    readonly RATE_LIMIT: "Rate limit exceeded. Please wait a moment and try again.";
    readonly CONTENT_POLICY: "Content violates OpenAI content policy";
    readonly NETWORK_ERROR: "Network error. Please check your connection and try again.";
    readonly UNKNOWN_ERROR: "An unexpected error occurred. Please try again.";
    readonly CANCELLED: "Generation cancelled by user";
};
/**
 * Storage errors
 */
export declare const STORAGE_ERRORS: {
    readonly SAVE_FAILED: "Failed to save data. Please try again.";
    readonly LOAD_FAILED: "Failed to load data. Please refresh and try again.";
    readonly QUOTA_EXCEEDED: "Storage quota exceeded. Please delete some prompts.";
};
/**
 * Import/Export errors
 */
export declare const IMPORT_EXPORT_ERRORS: {
    readonly EXPORT_FAILED: "Failed to export prompts. Please try again.";
    readonly IMPORT_FAILED: "Failed to import prompts. Please check the clipboard content.";
    readonly INVALID_JSON: "Clipboard content is not valid JSON";
};
/**
 * Success messages
 */
export declare const SUCCESS_MESSAGES: {
    readonly SAVED: "Saved successfully";
    readonly DELETED: "Deleted successfully";
    readonly EXPORTED: "Prompts exported to clipboard";
    readonly IMPORTED: "Prompts imported successfully";
    readonly CONNECTION_SUCCESS: "API key verified successfully";
    readonly RESET_COMPLETE: "All data has been reset";
};
/**
 * Confirmation messages
 */
export declare const CONFIRMATION_MESSAGES: {
    readonly DELETE_PROMPT: "Are you sure you want to delete this prompt?";
    readonly RESET_ALL_DATA: "This will delete all prompts and settings. Continue?";
};
//# sourceMappingURL=errorMessages.d.ts.map