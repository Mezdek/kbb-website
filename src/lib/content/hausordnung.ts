import fs from "node:fs";
import path from "node:path";
import { isRtlLanguage } from "@/lib/localized";
import { HAUSORDNUNG_LANGUAGES, type HausordnungLanguage } from "./hausordnungLanguages";

export interface AvailableHausordnungLanguage extends HausordnungLanguage {
  dir: "ltr" | "rtl";
}

const CONTENT_DIR = path.join(process.cwd(), "content", "hausordnung");

/**
 * Only the languages that actually have a Markdown file on disk, so the
 * picker can never offer a language that would render empty (CLAUDE.md:
 * /moschee/hausordnung — "the loader ... offers only the languages that
 * actually have a file"). `languages` defaults to the full canonical set
 * and is injectable so tests can exercise the absent-file case without
 * touching real content.
 */
export function getAvailableHausordnungLanguages(
  languages: readonly HausordnungLanguage[] = HAUSORDNUNG_LANGUAGES,
): AvailableHausordnungLanguage[] {
  return languages
    .filter((language) => fs.existsSync(path.join(CONTENT_DIR, `${language.code}.md`)))
    .map((language) => ({ ...language, dir: isRtlLanguage(language.code) ? "rtl" : "ltr" }));
}

/**
 * `?sprache=` validation (CLAUDE.md: /moschee/hausordnung). An unknown or
 * absent value resolves to `undefined`, which the page treats identically —
 * the language chooser, not the document.
 */
export function resolveHausordnungLanguage(
  requested: string | undefined,
  available: readonly { code: string }[],
): string | undefined {
  return available.some((language) => language.code === requested) ? requested : undefined;
}

export function readHausordnungDocument(code: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, `${code}.md`), "utf-8");
}
