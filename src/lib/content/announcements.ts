import fs from "node:fs";
import path from "node:path";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../../schemas/announcement.schema.json";
import type { Announcement, LocalizedText } from "@/types/announcement.schema";
import { resolveLocalized, type ResolvedLocalized } from "@/lib/localized";

export type { Announcement, LocalizedText };
export type ResolvedLocalizedText = ResolvedLocalized;

const CONTENT_DIR = path.join(process.cwd(), "content", "announcements");

let validator: ValidateFunction<Announcement> | undefined;

function getValidator(): ValidateFunction<Announcement> {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    validator = ajv.compile<Announcement>(schema);
  }
  return validator;
}

let cache: Announcement[] | undefined;

/**
 * Loads and validates every announcement in `content/announcements/`, then
 * asserts slug uniqueness across the whole set. Malformed JSON, a schema
 * violation, or a duplicate slug all throw — content problems must fail
 * loudly, not render blank (CLAUDE.md: Content > Validation).
 */
function loadAll(): Announcement[] {
  if (cache) {
    return cache;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".json"));
  const validate = getValidator();
  const items: Announcement[] = [];
  const slugToFile = new Map<string, string>();

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!validate(parsed)) {
      const details = (validate.errors ?? [])
        .map((error) => `${error.instancePath || "/"} ${error.message}`)
        .join("; ");
      throw new Error(`${filePath} failed schema validation: ${details}`);
    }

    const announcement = parsed as Announcement;
    const existingFile = slugToFile.get(announcement.slug);
    if (existingFile) {
      throw new Error(
        `Duplicate announcement slug "${announcement.slug}" in ${existingFile} and ${file}`,
      );
    }
    slugToFile.set(announcement.slug, file);
    items.push(announcement);
  }

  cache = items;
  return items;
}

export function isAnnouncementPinned(announcement: Announcement, now: Date): boolean {
  if (!announcement.pinnedUntil) {
    return false;
  }
  return new Date(announcement.pinnedUntil).getTime() > now.getTime();
}

/**
 * Returns every announcement, pinned-and-still-current first, then by
 * `publishDate` descending (CLAUDE.md: Content). `now` is injectable for
 * testability.
 */
export function getAnnouncements(now: Date = new Date()): Announcement[] {
  return [...loadAll()].sort((a, b) => {
    const aPinned = isAnnouncementPinned(a, now);
    const bPinned = isAnnouncementPinned(b, now);
    if (aPinned !== bPinned) {
      return aPinned ? -1 : 1;
    }
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });
}

/**
 * Categories that actually occur in the given announcement set, in the
 * order they first appear — not a hardcoded or exhaustive list (CLAUDE.md:
 * Content — "category is free text... no fixed list, no registry file").
 * Announcements without a category do not appear here (CLAUDE.md: Content —
 * "does not appear in the filter").
 */
export function getOccurringCategories(announcements: Announcement[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const item of announcements) {
    if (item.category && !seen.has(item.category)) {
      seen.add(item.category);
      categories.push(item.category);
    }
  }
  return categories;
}

export function filterByCategory(
  announcements: Announcement[],
  category: string | undefined,
): Announcement[] {
  if (!category) {
    return announcements;
  }
  return announcements.filter((item) => item.category === category);
}

/**
 * Resolves an announcement's `title`/`body` (keyed by arbitrary language
 * codes, at least one entry, no language mandatory) — a thin,
 * announcement-flavoured name for the shared `resolveLocalized` (CLAUDE.md
 * absolute rule 7: one source of truth per fact — the resolution order
 * itself is a fact, not to be re-implemented per domain).
 */
export function resolveLocalizedText(text: LocalizedText, locale: string): ResolvedLocalizedText {
  return resolveLocalized(text, locale);
}
