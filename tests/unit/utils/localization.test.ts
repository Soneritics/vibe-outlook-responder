import { detectOutlookLocale, getTranslations } from '../../../src/utils/localization';
import { translations, DEFAULT_LOCALE } from '../../../src/locales';

// Mock Office.js
const mockOfficeContext = {
  displayLanguage: 'en-US',
};

beforeEach(() => {
  (global as any).Office = {
    context: mockOfficeContext,
  };
});

describe('localization', () => {
  describe('detectOutlookLocale', () => {
    it('should detect English locale from en-US', () => {
      mockOfficeContext.displayLanguage = 'en-US';
      expect(detectOutlookLocale()).toBe('en');
    });

    it('should detect English locale from en-GB', () => {
      mockOfficeContext.displayLanguage = 'en-GB';
      expect(detectOutlookLocale()).toBe('en');
    });

    it('should detect German locale from de-DE', () => {
      mockOfficeContext.displayLanguage = 'de-DE';
      expect(detectOutlookLocale()).toBe('de');
    });

    it('should detect German locale from de-AT', () => {
      mockOfficeContext.displayLanguage = 'de-AT';
      expect(detectOutlookLocale()).toBe('de');
    });

    it('should detect French locale from fr-FR', () => {
      mockOfficeContext.displayLanguage = 'fr-FR';
      expect(detectOutlookLocale()).toBe('fr');
    });

    it('should detect French locale from fr-CA', () => {
      mockOfficeContext.displayLanguage = 'fr-CA';
      expect(detectOutlookLocale()).toBe('fr');
    });

    it('should detect Spanish locale from es-ES', () => {
      mockOfficeContext.displayLanguage = 'es-ES';
      expect(detectOutlookLocale()).toBe('es');
    });

    it('should detect Spanish locale from es-MX', () => {
      mockOfficeContext.displayLanguage = 'es-MX';
      expect(detectOutlookLocale()).toBe('es');
    });

    it('should fallback to default locale for unsupported language', () => {
      mockOfficeContext.displayLanguage = 'ja-JP';
      expect(detectOutlookLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should fallback to default locale for unsupported locale code', () => {
      mockOfficeContext.displayLanguage = 'xx-XX';
      expect(detectOutlookLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should fallback to default locale when Office context is unavailable', () => {
      delete (global as any).Office;
      expect(detectOutlookLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should handle malformed locale codes', () => {
      mockOfficeContext.displayLanguage = 'invalid';
      expect(detectOutlookLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should handle empty locale string', () => {
      mockOfficeContext.displayLanguage = '';
      expect(detectOutlookLocale()).toBe(DEFAULT_LOCALE);
    });
  });

  describe('getTranslations', () => {
    it('should return English translations by default', () => {
      const t = getTranslations();
      expect(t).toBe(translations.en);
      expect(t.common.save).toBe('Save');
    });

    it('should return German translations for de locale', () => {
      const t = getTranslations('de');
      expect(t).toBe(translations.de);
      expect(t.common.save).toBe('Speichern');
    });

    it('should return French translations for fr locale', () => {
      const t = getTranslations('fr');
      expect(t).toBe(translations.fr);
      expect(t.common.save).toBe('Enregistrer');
    });

    it('should return Spanish translations for es locale', () => {
      const t = getTranslations('es');
      expect(t).toBe(translations.es);
      expect(t.common.save).toBe('Guardar');
    });

    it('should fallback to default locale for unsupported locale', () => {
      const t = getTranslations('ja' as any);
      expect(t).toBe(translations[DEFAULT_LOCALE]);
    });

    it('should return consistent structure across all locales', () => {
      const locales: Array<'en' | 'de' | 'fr' | 'es'> = ['en', 'de', 'fr', 'es'];

      locales.forEach((locale) => {
        const t = getTranslations(locale);

        // Check common section exists
        expect(t.common).toBeDefined();
        expect(t.common.save).toBeDefined();
        expect(t.common.cancel).toBeDefined();

        // Check errors section exists
        expect(t.errors).toBeDefined();
        expect(t.errors.apiKey).toBeDefined();
        expect(t.errors.prompt).toBeDefined();
        expect(t.errors.generation).toBeDefined();

        // Check settings section exists
        expect(t.settings).toBeDefined();
        expect(t.settings.title).toBeDefined();
        expect(t.settings.apiKey).toBeDefined();
      });
    });
  });

  describe('Translation completeness', () => {
    it('should have all keys in German translation', () => {
      const enKeys = getAllKeys(translations.en);
      const deKeys = getAllKeys(translations.de);
      expect(deKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have all keys in French translation', () => {
      const enKeys = getAllKeys(translations.en);
      const frKeys = getAllKeys(translations.fr);
      expect(frKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have all keys in Spanish translation', () => {
      const enKeys = getAllKeys(translations.en);
      const esKeys = getAllKeys(translations.es);
      expect(esKeys.sort()).toEqual(enKeys.sort());
    });
  });
});

/**
 * Helper function to get all keys from nested object
 */
function getAllKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).reduce((keys: string[], key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...keys, ...getAllKeys(obj[key], fullKey)];
    }

    return [...keys, fullKey];
  }, []);
}
