/**
 * Localization utilities for multi-language support
 * Detects Outlook locale and provides translation functions
 */

/**
 * Supported locales
 */
export type SupportedLocale = 'en' | 'de' | 'fr' | 'es';

/**
 * Translation keys structure
 */
export interface Translations {
  [key: string]: string | Translations;
}

/**
 * Current locale (defaults to English)
 */
let currentLocale: SupportedLocale = 'en';

/**
 * Loaded translations for current locale
 */
let translations: Translations = {};

/**
 * Detects the user's Outlook locale
 * @returns The detected locale code
 */
export function detectOutlookLocale(): SupportedLocale {
  // Default to English
  let locale: SupportedLocale = 'en';

  try {
    // Try to get Office locale
    const displayLanguage = Office?.context?.displayLanguage;
    if (displayLanguage) {
      // Split and extract language code  
      const parts = displayLanguage.split('-');
      if (parts.length > 0 && parts[0]) {
        const languageCode = parts[0].toLowerCase();
        const supportedLocales: SupportedLocale[] = ['en', 'de', 'fr', 'es'];
        if (supportedLocales.includes(languageCode as SupportedLocale)) {
          locale = languageCode as SupportedLocale;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to detect Outlook locale, defaulting to English');
  }

  return locale;
}

/**
 * Initializes localization by loading the appropriate locale file
 * @param locale - Optional locale to use (auto-detects if not provided)
 */
export async function initLocalization(
  locale?: SupportedLocale
): Promise<void> {
  currentLocale = locale ?? detectOutlookLocale();

  try {
    // Dynamically import the locale file
    const localeModule = await import(`../locales/${currentLocale}.json`);
    translations = (localeModule.default ?? localeModule) as Translations;
  } catch (error) {
    console.error(`Failed to load locale ${currentLocale}, using English`);
    currentLocale = 'en';
    const englishModule = await import('../locales/en.json');
    translations = (englishModule.default ?? englishModule) as Translations;
  }
}

/**
 * Gets a translated string by key path
 * @param keyPath - Dot-separated key path (e.g., "errors.apiKey.required")
 * @param fallback - Optional fallback text if key not found
 * @returns The translated string or fallback
 */
export function t(keyPath: string, fallback?: string): string {
  const keys = keyPath.split('.');
  let value: string | Translations | undefined = translations;

  for (const key of keys) {
    if (value !== undefined && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback ?? keyPath;
    }
  }

  if (typeof value === 'string') {
    return value;
  }
  
  return fallback ?? keyPath;
}

/**
 * Gets the current locale
 * @returns The current locale code
 */
export function getCurrentLocale(): SupportedLocale {
  return currentLocale;
}
