import { Fragment, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { withNativeNumerals } from "@/lib/date";
import { formatHijriNumeral, hijriMonthSlug } from "@/lib/hijri";
import { gregorianModeSeparatorDates, hijriModeSeparatorDates } from "@/lib/prayer-times/separators";
import { Ltr } from "./Ltr";
import type { PrayerDay } from "@/lib/prayer-times/types";

const HEADER_CLASS =
  "px-2 py-2.5 text-end text-xs font-medium uppercase tracking-[0.14em] text-text-secondary";
const COLUMN_COUNT = 9; // weekday, Gregorian date, Hijri date, 6 prayers

// Forces browsers to print background colours regardless of the user's
// "print backgrounds" setting — otherwise the Ayyam al-Bid shading (a
// background-colour marking, unlike Friday's border) silently disappears on
// paper, which would fail the "must survive @media print" requirement.
const PRINT_COLOR_ADJUST: CSSProperties = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

function isFriday(isoDate: string): boolean {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay() === 5;
}

// Ayyam al-Bid ("the White Days"): Hijri days 13, 14 and 15 of every month,
// traditionally recommended fasting days. Read straight off the row's own
// `hijri.day` — never computed here (CLAUDE.md: Prayer times, /moschee/gebetszeiten).
function isAyyamAlBid(hijriDay: number): boolean {
  return hijriDay >= 13 && hijriDay <= 15;
}

/**
 * The desktop/print monthly table — never rendered on the phone, which gets
 * its own single-day view instead (CLAUDE.md: /moschee/gebetszeiten,
 * "mobile is a single day per page"). No client state left in this
 * component (the old mobile tap-to-expand rows are gone with it), so it's a
 * plain Server Component now.
 *
 * `mode` decides which calendar owns the row order the caller already
 * fetched (`days`) and which kind of separator row is inserted:
 * Gregorian-mode rows get a separator wherever a Hijri month begins,
 * Hijri-mode rows get one wherever a Gregorian month begins (CLAUDE.md:
 * "Two listing modes, switchable by the visitor").
 *
 * `missing` flags a Hijri-mode view cut off at one end because the
 * adjoining Gregorian year file hasn't been uploaded yet — the one place
 * partial data is allowed (CLAUDE.md: /moschee/gebetszeiten).
 */
export async function PrayerTable({
  days,
  todayIso,
  locale,
  mode,
  missing = [],
}: {
  days: PrayerDay[];
  todayIso: string;
  locale: string;
  mode: "gregorian" | "hijri";
  missing?: ("start" | "end")[];
}) {
  const t = await getTranslations("prayerTimes.table");
  const tHijriMonths = await getTranslations("hijri.months");

  const numeralLocale = withNativeNumerals(locale);
  const weekdayFormatter = new Intl.DateTimeFormat(numeralLocale, { weekday: "short" });
  const dateFormatter = new Intl.DateTimeFormat(numeralLocale, { day: "numeric", month: "short" });
  const gregorianMonthFormatter = new Intl.DateTimeFormat(numeralLocale, {
    month: "long",
    year: "numeric",
  });

  const separatorDates =
    mode === "gregorian" ? gregorianModeSeparatorDates(days) : hijriModeSeparatorDates(days);

  return (
    <table className="w-full border-collapse text-[15px] [font-variant-numeric:tabular-nums]">
      <thead>
        <tr className="border-b-2 border-primary">
          <th className={`${HEADER_CLASS} text-start`}>{t("weekday")}</th>
          <th className={`${HEADER_CLASS} text-start`}>{t("date")}</th>
          <th className={`${HEADER_CLASS} text-start`}>{t("hijriDate")}</th>
          <th className={HEADER_CLASS}>{t("fajr")}</th>
          <th className={HEADER_CLASS}>{t("shuruq")}</th>
          <th className={HEADER_CLASS}>{t("dhuhr")}</th>
          <th className={HEADER_CLASS}>{t("asr")}</th>
          <th className={HEADER_CLASS}>{t("maghrib")}</th>
          <th className={HEADER_CLASS}>{t("isha")}</th>
        </tr>
      </thead>
      <tbody>
        {missing.includes("start") && (
          <tr className="border-b border-dashed border-secondary/60 bg-secondary/10">
            <td colSpan={COLUMN_COUNT} className="px-2 py-2 text-xs text-text-secondary">
              {t("missingStart")}
            </td>
          </tr>
        )}
        {days.map((day, index) => {
          const isToday = day.date === todayIso;
          const date = new Date(`${day.date}T12:00:00Z`);

          const friday = isFriday(day.date);
          const ayyamAlBid = isAyyamAlBid(day.hijri.day);
          // Friday: a thicker start-side border (never a physical `border-left`
          // — CLAUDE.md: /moschee/gebetszeiten). Against the solid "today"
          // background the usual dark border colour would be invisible, so
          // it switches to a light one there.
          const fridayClass = friday
            ? `border-s-4 ${isToday ? "border-secondary-shade-2" : "border-primary"}`
            : "";
          // Ayyam al-Bid: a distinct background shade *plus* a dashed
          // bottom border, so the marking doesn't rely on colour alone. It
          // yields to the "today" treatment the same way zebra striping
          // does — today is already unambiguous without it.
          const rowClass = isToday
            ? `bg-primary text-secondary-shade-2 border-b border-t border-primary ${fridayClass}`
            : `${
                ayyamAlBid
                  ? "border-b-2 border-dashed border-secondary-shade-1 bg-secondary-shade-1/25"
                  : `border-b border-secondary/30 ${index % 2 === 1 ? "bg-secondary/13" : ""}`
              } ${fridayClass}`;
          const rowStyle = !isToday && ayyamAlBid ? PRINT_COLOR_ADJUST : undefined;

          const showSeparator = separatorDates.has(day.date);
          const separatorLabel =
            mode === "gregorian"
              ? t("hijriMonthBegins", { month: tHijriMonths(hijriMonthSlug(day.hijri.month)) })
              : t("gregorianMonthBegins", { month: gregorianMonthFormatter.format(date) });

          return (
            <Fragment key={day.date}>
              {showSeparator && (
                <tr className="border-b border-secondary/45 bg-secondary/20">
                  <td
                    colSpan={COLUMN_COUNT}
                    className="px-2 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary"
                  >
                    {separatorLabel}
                  </td>
                </tr>
              )}
              <tr className={rowClass} style={rowStyle}>
                <td
                  className={`px-2 text-start ${isToday ? "py-2.5 font-medium" : "py-2 text-text-secondary"}`}
                >
                  {weekdayFormatter.format(date)}
                  {isToday && (
                    <span className="ms-2 text-[11px] uppercase tracking-[0.12em] text-secondary-shade-1">
                      {t("today")}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-start">
                  <Ltr>{dateFormatter.format(date)}</Ltr>
                </td>
                <td className="px-2 py-2 text-start">
                  {formatHijriNumeral(day.hijri.day, locale)}{" "}
                  {tHijriMonths(hijriMonthSlug(day.hijri.month))}
                </td>
                <td className="px-2 py-2 text-end">
                  <Ltr>{day.fajr}</Ltr>
                </td>
                <td className="px-2 py-2 text-end">
                  <Ltr>{day.shuruq}</Ltr>
                </td>
                <td className="px-2 py-2 text-end">
                  <Ltr>{day.dhuhr}</Ltr>
                </td>
                <td className={`px-2 py-2 text-end ${isToday ? "font-bold" : ""}`}>
                  <Ltr>{day.asr}</Ltr>
                </td>
                <td className="px-2 py-2 text-end">
                  <Ltr>{day.maghrib}</Ltr>
                </td>
                <td className="px-2 py-2 text-end">
                  <Ltr>{day.isha}</Ltr>
                </td>
              </tr>
            </Fragment>
          );
        })}
        {missing.includes("end") && (
          <tr className="border-t border-dashed border-secondary/60 bg-secondary/10">
            <td colSpan={COLUMN_COUNT} className="px-2 py-2 text-xs text-text-secondary">
              {t("missingEnd")}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

