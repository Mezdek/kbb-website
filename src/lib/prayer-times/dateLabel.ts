import { formatHijriDate } from "@/lib/hijri";
import { withNativeNumerals } from "@/lib/date";
import type { PrayerDay } from "./types";

export interface PrayerDayLabel {
  weekday: string;
  gregorianLabel: string;
  hijriLabel: string;
  /** Both calendars in one string, in the order/punctuation the design uses
   * per locale (CLAUDE.md: Design — Arabic screens get their own review,
   * not a mirror of the German layout). */
  combined: string;
}

/**
 * Formats a prayer day's weekday + both calendar dates for display. Used
 * wherever "today" or a specific day needs a human date heading — the
 * prayer band, the mobile single-day view — so this locale-aware
 * composition exists in exactly one place (CLAUDE.md absolute rule 7).
 * `hijriMonthName` is supplied by the caller since resolving it requires
 * `getTranslations`, which only Server Components can call directly.
 */
export function formatPrayerDayLabel(
  day: PrayerDay,
  locale: string,
  hijriMonthName: string,
): PrayerDayLabel {
  const numeralLocale = withNativeNumerals(locale);
  const date = new Date(`${day.date}T12:00:00Z`);

  const weekday = new Intl.DateTimeFormat(numeralLocale, {
    weekday: "long",
    calendar: "gregory",
  }).format(date);
  const gregorianLabel = new Intl.DateTimeFormat(numeralLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    calendar: "gregory",
  }).format(date);
  const hijriLabel = formatHijriDate(day.hijri, hijriMonthName, locale);

  const combined =
    locale === "ar"
      ? `${weekday} ${hijriLabel} — ${gregorianLabel}`
      : `${weekday}, ${gregorianLabel} · ${hijriLabel}`;

  return { weekday, gregorianLabel, hijriLabel, combined };
}
