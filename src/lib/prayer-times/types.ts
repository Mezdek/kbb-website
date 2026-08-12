import type { Day } from "@/types/prayer-times.schema";

/** A day with its ISO date attached, as returned by the loader — `Day` from
 * the generated schema plus the date key the file format itself omits. */
export type PrayerDay = Day & { date: string };

export type PrayerDayResult =
  | { status: "ok"; day: PrayerDay; month: PrayerDay[] }
  | { status: "not-uploaded" }
  | { status: "date-not-found" };

export type PrayerMonthResult =
  { status: "ok"; days: PrayerDay[] } | { status: "not-uploaded" } | { status: "date-not-found" };

/**
 * `complete: false` is the one place partial data is allowed (CLAUDE.md:
 * /moschee/gebetszeiten) — a Hijri month cut off at one end because the
 * adjoining Gregorian year file hasn't been uploaded. Distinct from
 * `not-uploaded`, which is for when the requested period has no data at
 * all.
 */
export type PrayerHijriMonthResult =
  | { status: "ok"; days: PrayerDay[]; complete: boolean; missing: ("start" | "end")[] }
  | { status: "not-uploaded" }
  | { status: "date-not-found" };
