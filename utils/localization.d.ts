/**
 * Localization utilities for multi-language support
 * Detects Outlook locale and provides translation functions
 */
import { TranslationStrings, Locale } from '../locales';
/**
 * Gets translations for the specified locale
 * @param locale - Optional locale to get translations for (auto-detects if not provided)
 * @returns Translation strings for the specified locale
 */
export declare function getTranslations(locale?: Locale): TranslationStrings;
/**
 * Detects the user's Outlook locale
 * @returns The detected locale code
 */
export declare function detectOutlookLocale(): Locale;
/**
 * Gets a translated string by key path
 * @param keyPath - Dot-separated key path (e.g., "errors.apiKey.required")
 * @param locale - Optional locale to use (auto-detects if not provided)
 * @param fallback - Optional fallback text if key not found
 * @returns The translated string or fallback
 */
export declare function t(keyPath: string, locale?: Locale, fallback?: string): string;
//# sourceMappingURL=localization.d.ts.map