import type { Announcement, LocalizedText } from "@/types/announcement.schema";
import { resolveLocalized, type ResolvedLocalized } from "@/lib/localized";

export type { Announcement, LocalizedText };
export type ResolvedLocalizedText = ResolvedLocalized;

/**
 * Announcements are no longer hand-authored JSON read from disk — they
 * come from `useAnnouncements` (src/hooks/useAnnouncements.ts), which calls
 * the `/api/announcements` endpoint. Everything in this file is pure data
 * transforms over whatever list that hook returns, so it works the same
 * regardless of where the data came from.
 */

export function isAnnouncementPinned(announcement: Announcement, now: Date): boolean {
  if (!announcement.pinnedUntil) {
    return false;
  }
  return new Date(announcement.pinnedUntil).getTime() > now.getTime();
}

/**
 * Sorts announcements pinned-and-still-current first, then by
 * `publishDate` descending (CLAUDE.md: Content — "Ordering"). Does not
 * mutate the input array. `now` is injectable for testability, and this is
 * the single sort implementation shared by the full `/aktuelles` list and
 * the homepage teaser (CLAUDE.md absolute rule 7: one source of truth per
 * fact).
 */
export function sortAnnouncements(
  announcements: Announcement[],
  now: Date = new Date(),
): Announcement[] {
  return [...announcements].sort((a, b) => {
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
