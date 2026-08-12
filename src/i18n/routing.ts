import { defineRouting } from "next-intl/routing";

// URLs stay German in every locale — only the locale prefix changes
// (CLAUDE.md: i18n). No `pathnames` map: do not configure localized
// pathnames. `/moschee/hausordnung` in particular is a fixed QR-code target.
export const routing = defineRouting({
  locales: ["de", "ar", "en"],
  defaultLocale: "de",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/**
 * The floor every missing key and every unresolved localized value falls back
 * to (CLAUDE.md: i18n). Distinct from `defaultLocale`, which is what an
 * unrecognised visitor gets — this is what fills a gap.
 */
export const fallbackLocale = "en" satisfies Locale;
