export interface HausordnungLanguage {
  code: string;
  endonym: string;
}

/**
 * The seven languages the printed house rules are offered in, independent
 * of the three site locales (CLAUDE.md: /moschee/hausordnung). Endonyms are
 * shared, untranslated data — never localized message keys — so every
 * locale's picker shows the same list in the same script.
 */
export const HAUSORDNUNG_LANGUAGES: HausordnungLanguage[] = [
  { code: "de", endonym: "Deutsch" },
  { code: "ar", endonym: "العربية" },
  { code: "en", endonym: "English" },
  { code: "fa", endonym: "فارسی" },
  { code: "tr", endonym: "Türkçe" },
  { code: "ru", endonym: "Русский" },
  { code: "id", endonym: "Bahasa Indonesia" },
];
