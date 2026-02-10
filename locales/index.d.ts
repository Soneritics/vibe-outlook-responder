export type Locale = 'en' | 'de' | 'fr' | 'es' | 'nl';
export interface TranslationStrings {
    common: {
        save: string;
        cancel: string;
        delete: string;
        confirm: string;
        retry: string;
        close: string;
        loading: string;
    };
    errors: {
        apiKey: {
            required: string;
            invalidFormat: string;
            connectionFailed: string;
        };
        prompt: {
            titleRequired: string;
            titleTooLong: string;
            titleDuplicate: string;
            contentRequired: string;
            contentTooLong: string;
        };
        generation: {
            noApiKey: string;
            noEmailContent: string;
            invalidApiKey: string;
            apiUnavailable: string;
            rateLimit: string;
            contentPolicy: string;
            networkError: string;
            unknownError: string;
            cancelled: string;
        };
        storage: {
            saveFailed: string;
            loadFailed: string;
            quotaExceeded: string;
        };
        importExport: {
            exportFailed: string;
            importFailed: string;
            invalidJson: string;
        };
    };
    success: {
        saved: string;
        deleted: string;
        exported: string;
        imported: string;
        connectionSuccess: string;
        resetComplete: string;
    };
    confirmation: {
        deletePrompt: string;
        resetAllData: string;
    };
    settings: {
        title: string;
        apiKey: {
            label: string;
            placeholder: string;
            testConnection: string;
        };
        model: {
            label: string;
            gpt5: string;
            gpt4: string;
            gpt4turbo: string;
            gpt35turbo: string;
        };
        exportImport: {
            title: string;
            export: string;
            import: string;
        };
        resetAllData: string;
    };
    prompts: {
        title: string;
        addNew: string;
        editor: {
            title: string;
            titleLabel: string;
            titlePlaceholder: string;
            contentLabel: string;
            contentPlaceholder: string;
        };
        emptyState: string;
    };
    generation: {
        progress: {
            preparing: string;
            sending: string;
            generating: string;
            done: string;
            cancel: string;
        };
        summarizationNotice: string;
    };
    ribbon: {
        aiResponder: string;
        settings: string;
    };
}
/**
 * Available translations mapped by locale code
 */
export declare const translations: Record<Locale, TranslationStrings>;
/**
 * Default locale to use when user's locale is not supported
 */
export declare const DEFAULT_LOCALE: Locale;
/**
 * Supported locales
 */
export declare const SUPPORTED_LOCALES: Locale[];
/**
 * Locale names for display in UI
 */
export declare const LOCALE_NAMES: Record<Locale, string>;
//# sourceMappingURL=index.d.ts.map