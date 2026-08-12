import path from "node:path";
import { fallbackLocale } from "@/i18n/routing";
import { isRtlLanguage } from "@/lib/localized";
import { loadMarkdownFiles } from "./markdownDirectory";

export interface ContentDocument {
  markdown: string;
  lang: string;
  dir: "ltr" | "rtl";
}

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Every `<slug>/<lang>.md` under `content/`, read once at module load via
 * the shared walker in `markdownDirectory.ts`. Covers every long-form
 * document rendered through `renderMarkdown` and, where the template has
 * `{{placeholders}}`, through `interpolate` first — Impressum, Datenschutz,
 * Über uns, Mitglied werden. Not `Hausordnung`, which has its own loader
 * because it is picked by `?sprache=` independent of the page locale and
 * is not restricted to the three UI locales.
 */
const DOCUMENTS = loadMarkdownFiles(CONTENT_DIR);

/**
 * The document for a locale, falling back the way every localized value
 * does: active locale, then the fallback locale, then any translation that
 * exists. `lang` and `dir` describe what was actually found, so a German
 * document served inside an Arabic page is marked correctly.
 *
 * Throws when a slug has no files at all. That is a defect in this repo,
 * not a state a visitor should ever see rendered as an empty page.
 */
export function getContentDocument(slug: string, locale: string): ContentDocument {
  const preferred = [locale, fallbackLocale].find((code) => DOCUMENTS.has(`${slug}/${code}`));
  const key = preferred
    ? `${slug}/${preferred}`
    : [...DOCUMENTS.keys()].find((candidate) => candidate.startsWith(`${slug}/`));

  if (!key) {
    throw new Error(`No content document in content/${slug}`);
  }

  const lang = key.slice(slug.length + 1);
  return {
    markdown: DOCUMENTS.get(key)!,
    lang,
    dir: isRtlLanguage(lang) ? "rtl" : "ltr",
  };
}
