import path from "node:path";
import { isRtlLanguage } from "@/lib/localized";
import { loadMarkdownFiles } from "./markdownDirectory";

export interface HausordnungDocument {
  code: string;
  dir: "ltr" | "rtl";
}

const CONTENT_DIR = path.join(process.cwd(), "content", "hausordnung");

/**
 * Every `<code>.md` in the content directory, read once at module load via
 * the shared walker in `markdownDirectory.ts`. Adding a language is
 * dropping in a file — no registry to update, and the picker can never
 * offer a language that would render empty.
 */
const DOCUMENTS: ReadonlyMap<string, string> = loadMarkdownFiles(CONTENT_DIR);

/**
 * Languages on offer, by file name. Display names are not resolved here —
 * the page looks each code up in `common.localeNames` and falls back to the
 * bare code, so `ckb.md` appears as "ckb" rather than not at all.
 */
export const HAUSORDNUNG_DOCUMENTS: readonly HausordnungDocument[] = [...DOCUMENTS.keys()]
  .sort()
  .map((code) => ({
    code,
    dir: isRtlLanguage(code) ? ("rtl" as const) : ("ltr" as const),
  }));

/**
 * `?sprache=` validation. An unknown or absent value resolves to
 * `undefined`, which the page treats identically — the chooser, not the
 * document.
 */
export function resolveHausordnungLanguage(requested: string | undefined): string | undefined {
  return requested && DOCUMENTS.has(requested) ? requested : undefined;
}

export function readHausordnungDocument(code: string): string {
  const document = DOCUMENTS.get(code);
  if (!document) {
    throw new Error(`No Hausordnung document for language "${code}"`);
  }
  return document;
}
