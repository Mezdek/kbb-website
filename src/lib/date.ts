const BERLIN_TZ = "Europe/Berlin";

/**
 * The site has a single location (Brandenburg an der Havel) and prayer
 * times are authored in local wall-clock time (CEST/CET). The deploy server
 * may run in any timezone, so "now" for prayer-time purposes must always be
 * read in Europe/Berlin explicitly — never the server's local `Date` output.
 */
export function getBerlinDateParts(date: Date = new Date()): { isoDate: string; hhmm: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BERLIN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return {
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
  };
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Bare `Intl.DateTimeFormat("ar", ...)` renders Western digits in this
 * runtime's ICU data, not the Eastern Arabic numerals the design requires
 * for everything except clock times (which stay Western/LTR deliberately).
 * Pass the result of this helper as the locale to any `Intl.DateTimeFormat`
 * or `Intl.NumberFormat` call whose output should follow the page's own
 * script — not just Hijri dates.
 */
export function withNativeNumerals(locale: string): string {
  return locale === "ar" ? "ar-u-nu-arab" : locale;
}

/**
 * Formats a plain integer (a year, a count) in the script the page's own
 * locale uses. Needed anywhere a raw number is interpolated into a
 * translated string — ICU's bare `{value}` placeholders do a plain
 * `String(value)`, not locale-aware number formatting, so passing a number
 * straight into `t()` always renders Western digits regardless of locale.
 */
export function formatNumeral(value: number, locale: string): string {
  return new Intl.NumberFormat(withNativeNumerals(locale), { useGrouping: false }).format(value);
}

function arabicHourWord(hours: number): string {
  if (hours === 1) return "ساعة";
  if (hours === 2) return "ساعتين";
  if (hours >= 3 && hours <= 10) return `${formatArabicDigits(hours)} ساعات`;
  return `${formatArabicDigits(hours)} ساعة`;
}

function formatArabicDigits(value: number): string {
  return new Intl.NumberFormat(withNativeNumerals("ar"), { useGrouping: false }).format(value);
}

/**
 * A short natural-language duration ("3 Std 30 Min" / "3h 30m" /
 * "٣ ساعات و٣٠ دقيقة"), matching the mockup's own phrasing. Arabic hour
 * pluralization follows the dual/few/many-adjacent forms for the small
 * counts this countdown actually produces (0-10h); it is a deliberate
 * simplification, not full CLDR plural-rule coverage.
 */
export function formatDuration(totalMinutes: number, locale: string): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (locale === "ar") {
    const hourPart = hours > 0 ? arabicHourWord(hours) : "";
    const minutePart = minutes > 0 || hours === 0 ? `${formatArabicDigits(minutes)} دقيقة` : "";
    return [hourPart, minutePart].filter(Boolean).join(" و");
  }

  if (locale === "de") {
    const parts = [];
    if (hours > 0) parts.push(`${hours} Std`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes} Min`);
    return parts.join(" ");
  }

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}
