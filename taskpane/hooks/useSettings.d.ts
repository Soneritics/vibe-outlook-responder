import { Settings } from '../../models/Settings';
interface UseSettingsReturn {
    settings: Settings;
    isLoading: boolean;
    error: string | null;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    resetSettings: () => Promise<void>;
    hasApiKey: boolean;
}
/**
 * Custom hook for managing user settings
 * Handles loading, saving, and resetting settings with proper state management
 */
export declare const useSettings: () => UseSettingsReturn;
export {};
//# sourceMappingURL=useSettings.d.ts.map