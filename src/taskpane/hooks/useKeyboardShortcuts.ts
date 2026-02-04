import { useEffect, useCallback } from 'react';

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
export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

/**
 * Default keyboard shortcuts for the add-in
 * These can be customized in settings (stored in SettingsStorage)
 */
export const DEFAULT_SHORTCUTS = {
  openPromptDropdown: 'Alt+P',
  openSettings: 'Alt+S',
  cancelGeneration: 'Escape',
};

/**
 * Parse keyboard shortcut string into components
 * Example: "Ctrl+Alt+P" => { ctrl: true, alt: true, key: "p" }
 */
export function parseShortcut(shortcutString: string): Omit<KeyboardShortcut, 'action'> {
  const parts = shortcutString.toLowerCase().split('+');
  const modifiers = parts.slice(0, -1);
  const key = parts[parts.length - 1] || '';

  return {
    key,
    ctrl: modifiers.includes('ctrl'),
    alt: modifiers.includes('alt'),
    shift: modifiers.includes('shift'),
  };
}

/**
 * Format keyboard shortcut for display
 * Example: { ctrl: true, key: "p" } => "Ctrl+P"
 */
export function formatShortcut(
  shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'alt' | 'shift'>
): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
