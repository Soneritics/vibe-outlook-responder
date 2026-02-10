/**
 * Localization utilities for multi-language support
 * Detects Outlook locale and provides translation functions
 */

import {
  translations,
  TranslationStrings,
  Locale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '../locales';

/**
 * Gets translations for the specified locale
 * @param locale - Optional locale to get translations for (auto-detects if not provided)
 * @returns Translation strings for the specified locale
 */
export function getTranslations(locale?: Locale): TranslationStrings {
  const targetLocale = locale ?? detectOutlookLocale();
  return translations[targetLocale] || translations[DEFAULT_LOCALE];
}

/**
 * Detects the user's Outlook locale
 * @returns The detected locale code
 */
export function detectOutlookLocale(): Locale {
  // Default to English
  let locale: Locale = DEFAULT_LOCALE;

  try {
    // Try to get Office locale
    const displayLanguage = Office?.context?.displayLanguage;
    if (displayLanguage) {
      // Split and extract language code
      const parts = displayLanguage.split('-');
      if (parts.length > 0 && parts[0]) {
        const languageCode = parts[0].toLowerCase();
        if (SUPPORTED_LOCALES.includes(languageCode as Locale)) {
          locale = languageCode as Locale;
        }
      }
    }
  } catch (_error) {
    console.warn('Failed to detect Outlook locale, defaulting to English');
  }

  return locale;
}

/**
 * Gets a translated string by key path
 * @param keyPath - Dot-separated key path (e.g., "errors.apiKey.required")
 * @param locale - Optional locale to use (auto-detects if not provided)
 * @param fallback - Optional fallback text if key not found
 * @returns The translated string or fallback
 */
export function t(keyPath: string, locale?: Locale, fallback?: string): string {
  const translations = getTranslations(locale);
  const keys = keyPath.split('.');
  let value: unknown = translations;

  for (const key of keys) {
    if (value !== null && value !== undefined && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return fallback ?? keyPath;
    }
  }

  if (typeof value === 'string') {
    return value;
  }

  return fallback ?? keyPath;
}
