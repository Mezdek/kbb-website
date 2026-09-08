import { describe, expect, it } from "vitest";
import type { Announcement } from "./announcements";
import {
  filterByCategory,
  getOccurringCategories,
  isAnnouncementPinned,
  sortAnnouncements,
} from "./announcements";

const NOW = new Date("2026-08-09T00:00:00Z");

function announcement(overrides: Partial<Announcement>): Announcement {
  return {
    slug: "test",
    publishDate: "2026-01-01",
    title: { de: "Titel" },
    body: { de: "Text" },
    ...overrides,
  };
}

describe("isAnnouncementPinned", () => {
  it("is false when pinnedUntil is not set", () => {
    expect(isAnnouncementPinned(announcement({}), NOW)).toBe(false);
  });

  it("is true while pinnedUntil is in the future", () => {
    expect(isAnnouncementPinned(announcement({ pinnedUntil: "2026-08-21" }), NOW)).toBe(true);
  });

  it("is false once pinnedUntil has passed", () => {
    expect(isAnnouncementPinned(announcement({ pinnedUntil: "2026-01-01" }), NOW)).toBe(false);
  });
});

describe("sortAnnouncements", () => {
  const eid = announcement({ slug: "eid", publishDate: "2026-08-15", pinnedUntil: "2026-08-21" });
  const tarawih = announcement({
    slug: "tarawih",
    publishDate: "2026-03-01",
    pinnedUntil: "2027-02-18",
  });
  const versammlung = announcement({ slug: "versammlung", publishDate: "2026-07-01" });
  const older = announcement({ slug: "older", publishDate: "2026-01-01" });

  it("sorts pinned-and-current items first, then by publishDate descending", () => {
    const items = sortAnnouncements([older, versammlung, tarawih, eid], NOW);
    // Both eid and tarawih are still pinned relative to NOW, so both sort
    // ahead of every non-pinned item; between the two, the more recently
    // published one (eid) sorts first.
    expect(items.map((a) => a.slug)).toEqual(["eid", "tarawih", "versammlung", "older"]);
  });

  it("does not treat an item as pinned once pinnedUntil has passed", () => {
    const farFuture = new Date("2027-06-01T00:00:00Z");
    const items = sortAnnouncements([older, versammlung, tarawih, eid], farFuture);
    expect(items[0]!.slug).not.toBe("tarawih");
  });

  it("does not mutate the input array", () => {
    const input = [older, eid];
    sortAnnouncements(input, NOW);
    expect(input).toEqual([older, eid]);
  });
});

describe("getOccurringCategories", () => {
  it("only returns categories present in the given set, in first-seen order", () => {
    const items = [
      announcement({ slug: "a", category: "ramadan" }),
      announcement({ slug: "b", category: "verein" }),
      announcement({ slug: "c" }),
      announcement({ slug: "d", category: "ramadan" }),
    ];
    expect(getOccurringCategories(items)).toEqual(["ramadan", "verein"]);
  });
});

describe("filterByCategory", () => {
  const items = [
    announcement({ slug: "a", category: "verein" }),
    announcement({ slug: "b", category: "ramadan" }),
    announcement({ slug: "c", category: "verein" }),
  ];

  it("filters to only the requested category", () => {
    const filtered = filterByCategory(items, "verein");
    expect(filtered.every((a) => a.category === "verein")).toBe(true);
    expect(filtered).toHaveLength(2);
  });

  it("returns everything when no category is given", () => {
    expect(filterByCategory(items, undefined)).toHaveLength(items.length);
  });
});
