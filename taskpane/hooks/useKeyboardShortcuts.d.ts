export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
}
interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}
/**
 * Hook for handling keyboard shortcuts in the add-in
 *
 * Note: Office Add-ins have limited keyboard shortcut support.
 * Native shortcuts like Ctrl+Z (undo) are handled by Office.js.
 * Custom shortcuts must not conflict with Outlook's built-in shortcuts.
 *
 * @param options - Shortcut configuration and enable state
 */
export declare const useKeyboardShortcuts: ({ shortcuts, enabled, }: UseKeyboardShortcutsOptions) => void;
/**
 * Default keyboard shortcuts for the add-in
 * These can be customized in settings (stored in SettingsStorage)
 */
export declare const DEFAULT_SHORTCUTS: {
    openPromptDropdown: string;
    openSettings: string;
    cancelGeneration: string;
};
/**
 * Parse keyboard shortcut string into components
 * Example: "Ctrl+Alt+P" => { ctrl: true, alt: true, key: "p" }
 */
export declare function parseShortcut(shortcutString: string): Omit<KeyboardShortcut, 'action'>;
/**
 * Format keyboard shortcut for display
 * Example: { ctrl: true, key: "p" } => "Ctrl+P"
 */
export declare function formatShortcut(shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'alt' | 'shift'>): string;
export {};
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map