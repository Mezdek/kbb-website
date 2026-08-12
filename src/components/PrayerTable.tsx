import { Fragment, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { withNativeNumerals } from "@/lib/date";
import { formatHijriNumeral, hijriMonthSlug } from "@/lib/hijri";
import {
  gregorianModeSeparatorDates,
  hijriModeSeparatorDates,
} from "@/lib/prayer-times/separators";
import { Ltr } from "./Ltr";
import type { PrayerDay } from "@/lib/prayer-times/types";

const HEADER_CLASS =
  "px-2 py-2.5 text-end text-xs font-medium uppercase tracking-[0.14em] text-text-secondary";

// weekday, Gregorian date, Hijri date, then the six prayers.
const COLUMNS = [
  "weekday",
  "date",
  "hijriDate",
  "fajr",
  "shuruq",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;
const START_ALIGNED_COLUMNS = 3; // weekday, date, hijriDate

// Forces browsers to print background colours regardless of the user's
// "print backgrounds" setting. Today is the only row marked by a background,
// so without this it loses its marking entirely on paper. Friday and Ayyam
// al-Bid are marked with borders, which print regardless.
const PRINT_COLOR_ADJUST: CSSProperties = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

function isFriday(isoDate: string): boolean {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay() === 5;
}

// Ayyam al-Bid ("the White Days"): Hijri days 13, 14 and 15 of every month.
// Read straight off the row's own `hijri.day` — never computed here
// (CLAUDE.md: Prayer times, /moschee/gebetszeiten).
function isAyyamAlBid(hijriDay: number): boolean {
  return hijriDay >= 13 && hijriDay <= 15;
}

/**
 * The three row markings are deliberately carried by three different
 * properties, so they compose on a row that is more than one of them and no
 * marking can mask another (CLAUDE.md: /moschee/gebetszeiten):
 *
 *   today          background colour
 *   Friday         thick solid border on the start side
 *   Ayyam al-Bid   dashed border on all four sides
 *
 * A Friday inside Ayyam al-Bid therefore shows three dashed sides and one
 * thick solid start side. Solid-vs-dashed distinguishes them, not hue, so
 * the pairing survives greyscale printing and red-green colour deficiency.
 *
 * Border colours invert on today's dark background: a dark border measures
 * 1.4:1 there and is invisible, while a light one measures 9.5:1. On the
 * light rows the reverse holds — dark borders measure 6.3–6.8:1, and
 * `secondary-shade-1` would be 1.0:1, i.e. the page colour itself.
 */
function rowMarkingClasses(options: {
  isToday: boolean;
  friday: boolean;
  ayyamAlBid: boolean;
  striped: boolean;
}): string {
  const { isToday, friday, ayyamAlBid, striped } = options;

  const onDark = isToday;
  const markColorStart = onDark ? "border-s-secondary-shade-2" : "border-s-primary";

  const classes: string[] = [];

  if (isToday) {
    classes.push("bg-primary-shade-1 text-secondary-shade-2");
  } else if (striped) {
    classes.push("bg-secondary/13");
  }

  if (ayyamAlBid) {
    classes.push("border-2 border-flair-shade-2");
  } else {
    // Ordinary hairline between rows. Side-specific colour so it never
    // collides with the shorthand colours above — with the shorthand,
    // stylesheet order decides the winner, not the order in this string.
    classes.push("border-b border-b-secondary/30");
  }

  if (friday) {
    // `border-s-4` after `border-2` widens only the start side. The style
    // must be re-declared as solid: `border-dashed` above is a shorthand
    // and would otherwise dash this side too.
    classes.push("border-s-4 [border-inline-start-style:solid]", markColorStart);
  }

  return classes.join(" ");
}

/**
 * The desktop/print monthly table — never rendered on the phone, which gets
 * its own single-day view instead (CLAUDE.md: /moschee/gebetszeiten,
 * "mobile is a single day per page"). No client state, so a plain Server
 * Component.
 *
 * `mode` decides which calendar owns the row order the caller already
 * fetched (`days`) and which kind of separator row is inserted:
 * Gregorian-mode rows get a separator wherever a Hijri month begins,
 * Hijri-mode rows get one wherever a Gregorian month begins.
 *
 * `missing` flags a Hijri-mode view cut off at one end because the
 * adjoining Gregorian year file hasn't been uploaded yet — the one place
 * partial data is allowed.
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

  // Names the table for screen readers by whichever calendar owns the row
  // order — the Gregorian month in Gregorian mode, the Hijri month in Hijri
  // mode. `days` is never empty here: the caller renders the "not uploaded"
  // state instead of an empty table.
  const firstDay = days[0];
  const captionMonth =
    mode === "gregorian"
      ? gregorianMonthFormatter.format(new Date(`${firstDay!.date}T12:00:00Z`))
      : `${tHijriMonths(hijriMonthSlug(firstDay!.hijri.month))} ${formatHijriNumeral(firstDay!.hijri.year, locale)}`;

  return (
    <table className="w-full border-collapse text-[15px] [font-variant-numeric:tabular-nums]">
      <caption className="sr-only">{t("caption", { month: captionMonth })}</caption>
      <thead>
        <tr className="border-b-2 border-b-primary">
          {COLUMNS.map((column, index) => (
            <th
              key={column}
              scope="col"
              className={`${HEADER_CLASS} ${index < START_ALIGNED_COLUMNS ? "text-start" : ""}`}
            >
              {t(column)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {missing.includes("start") && (
          <tr className="border-b border-dashed border-b-secondary/60 bg-secondary/10">
            <td colSpan={COLUMNS.length} className="px-2 py-2 text-xs text-text-secondary">
              {t("missingStart")}
            </td>
          </tr>
        )}

        {days.map((day, index) => {
          const isToday = day.date === todayIso;
          const date = new Date(`${day.date}T12:00:00Z`);
          const friday = isFriday(day.date);
          const ayyamAlBid = isAyyamAlBid(day.hijri.day);

          const rowClass = rowMarkingClasses({
            isToday,
            friday,
            ayyamAlBid,
            striped: index % 2 === 1,
          });

          const showSeparator = separatorDates.has(day.date);
          const separatorLabel =
            mode === "gregorian"
              ? t("hijriMonthBegins", { month: tHijriMonths(hijriMonthSlug(day.hijri.month)) })
              : t("gregorianMonthBegins", { month: gregorianMonthFormatter.format(date) });

          return (
            <Fragment key={day.date}>
              {showSeparator && (
                <tr className="border-b border-b-secondary/45 bg-secondary/20">
                  <td
                    colSpan={COLUMNS.length}
                    className="px-2 py-1.5 text-xs uppercase tracking-[0.12em] text-text-secondary"
                  >
                    {separatorLabel}
                  </td>
                </tr>
              )}

              <tr className={rowClass} style={isToday ? PRINT_COLOR_ADJUST : undefined}>
                <th
                  scope="row"
                  className={`px-2 text-start font-normal ${
                    isToday ? "py-2.5 font-medium" : "py-2 text-text-secondary"
                  }`}
                >
                  {weekdayFormatter.format(date)}
                  {isToday && (
                    <span className="ms-2 text-[11px] uppercase tracking-[0.12em] text-secondary-shade-1">
                      {t("today")}
                    </span>
                  )}
                </th>
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
                <td className="px-2 py-2 text-end">
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
          <tr className="border-t border-dashed border-t-secondary/60 bg-secondary/10">
            <td colSpan={COLUMNS.length} className="px-2 py-2 text-xs text-text-secondary">
              {t("missingEnd")}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
