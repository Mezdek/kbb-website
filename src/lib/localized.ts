import { fallbackLocale } from "@/i18n/routing";

// Languages this site's content is known to render right-to-left. Localized
// values are not restricted to the three UI locales, so this covers the
// language-key case generally rather than special-casing "ar".
const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "yi", "ckb"]);

export interface ResolvedLocalized {
  text: string;
  lang: string;
  dir: "ltr" | "rtl";
}

/**
 * Whether a language code is known to be written right-to-left. The single
 * source of truth for this fact (CLAUDE.md absolute rule 7) — shared by
 * `resolveLocalized` below and by the `/moschee/hausordnung` document
 * language loader, which is not restricted to the three UI locales either.
 */
export function isRtlLanguage(lang: string): boolean {
  return RTL_LANGUAGES.has(lang);
}

/**
 * Resolves any `{[languageCode]: string}`-shaped value — announcement
 * `title`/`body`, `config/site.json`'s `org.localizedName`/`org.mosqueName`
 * — against the active locale, then the fallback locale, then any
 * available entry (CLAUDE.md: Configuration, Content). The returned
 * `lang`/`dir` describe the language actually chosen, for the caller to
 * set on the rendered element when that differs from the page's own
 * direction — never assume a given language is present.
 */
export function resolveLocalized(value: Record<string, string>, locale: string): ResolvedLocalized {
  const lang =
    locale in value ? locale : fallbackLocale in value ? fallbackLocale : Object.keys(value)[0];
  if (!lang) {
    throw new Error("Localized value has no entries");
  }
  return { text: value[lang]!, lang, dir: isRtlLanguage(lang) ? "rtl" : "ltr" };
}
