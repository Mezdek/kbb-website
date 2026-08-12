import { formatNumeral } from "./date";
import type { Day } from "@/types/prayer-times.schema";

type HijriDate = Day["hijri"];

/**
 * The prayer times file stores `hijri.month` as a number 1–12 (see
 * schemas/prayer-times.schema.json). The message files key their
 * translations by slug under `hijri.months.*`. This is the only place the
 * two are mapped.
 */
export const HIJRI_MONTH_SLUGS = [
  "muharram",
  "safar",
  "rabi-al-awwal",
  "rabi-al-thani",
  "jumada-al-awwal",
  "jumada-al-thani",
  "rajab",
  "shaban",
  "ramadan",
  "shawwal",
  "dhu-al-qadah",
  "dhu-al-hijjah",
] as const;

export type HijriMonthSlug = (typeof HIJRI_MONTH_SLUGS)[number];

/**
 * Slug for a 1-based Hijri month number. Throws on anything outside 1–12:
 * the schema already constrains the value, so an out-of-range month means
 * unvalidated data reached the renderer, and a silently empty month name
 * would be worse than a visible failure.
 */
export function hijriMonthSlug(month: number): HijriMonthSlug {
  const slug = HIJRI_MONTH_SLUGS[month - 1];
  if (!slug) {
    throw new Error(`Invalid Hijri month: ${month}`);
  }
  return slug;
}

/**
 * Formats a number using the digit script conventions for the given locale.
 * This is presentation only — Eastern Arabic numerals for `ar`, Western
 * otherwise — never calendar arithmetic (CLAUDE.md: Prayer times — "this
 * site contains no Hijri conversion").
 */
export function formatHijriNumeral(value: number, locale: string): string {
  return formatNumeral(value, locale);
}

/**
 * Renders a structured Hijri date `{day, month, year}` (as supplied by the
 * prayer-time generator's JSON, already offset) using a locale-specific
 * month name looked up by the caller via `hijri.months.<slug>`, where the
 * slug comes from `hijriMonthSlug(hijri.month)`.
 */
export function formatHijriDate(hijri: HijriDate, monthName: string, locale: string): string {
  const day = formatHijriNumeral(hijri.day, locale);
  const year = formatHijriNumeral(hijri.year, locale);

  if (locale === "de") {
    return `${day}. ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}
