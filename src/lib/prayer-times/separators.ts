import type { PrayerDay } from "./types";

/**
 * Dates that should get a "new Hijri month begins" separator row above them,
 * for the Gregorian-mode listing (CLAUDE.md: /moschee/gebetszeiten — "one
 * Gregorian month, separator where a Hijri month begins"). The first row
 * never gets one, even if it happens to be Hijri day 1 — there is nothing
 * to separate it from.
 */
export function gregorianModeSeparatorDates(days: PrayerDay[]): Set<string> {
  const dates = new Set<string>();
  for (let i = 1; i < days.length; i++) {
    if (days[i]!.hijri.day === 1) {
      dates.add(days[i]!.date);
    }
  }
  return dates;
}

/**
 * Dates that should get a "new Gregorian month begins" separator row above
 * them, for the Hijri-mode listing (CLAUDE.md: /moschee/gebetszeiten — "one
 * Hijri month, separator where a Gregorian month begins"). The first row
 * never gets one.
 */
export function hijriModeSeparatorDates(days: PrayerDay[]): Set<string> {
  const dates = new Set<string>();
  for (let i = 1; i < days.length; i++) {
    if (days[i]!.date.slice(8, 10) === "01") {
      dates.add(days[i]!.date);
    }
  }
  return dates;
}
