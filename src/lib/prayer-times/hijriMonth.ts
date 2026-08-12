import type { PrayerDay } from "./types";

export interface HijriMonthMergeResult {
  status: "ok";
  days: PrayerDay[];
  complete: boolean;
  missing: ("start" | "end")[];
}

/**
 * Pure merge/boundary logic for a Hijri month that may span two Gregorian
 * year files (CLAUDE.md: /moschee/gebetszeiten — "a Hijri month can span two
 * Gregorian year files"). No file I/O and no calendar computation: it only
 * reads the `hijri.year`/`hijri.month` values already present in the data,
 * and treats hitting a Gregorian year file's own first/last day (Jan 1 /
 * Dec 31) as the signal that the adjoining file needs to be consulted.
 *
 * `anchorYear`/`anchorYearDays` are the year file containing `referenceDate`
 * — the caller has already confirmed `referenceDate` exists in it.
 * `previousYearDays`/`nextYearDays` are `undefined` when that adjoining
 * file has not been uploaded at all, and an array (possibly, if the data is
 * unusual, containing no day belonging to this Hijri month) when it has.
 * Either shape is treated as "the gap is not filled" when it doesn't
 * actually supply the missing days — this never fails loudly the way a
 * missing anchor file does, because a partial Hijri-month view is
 * explicitly allowed (CLAUDE.md: "this is the one place partial data is
 * allowed").
 */
export function resolveHijriMonth(params: {
  referenceDate: string;
  anchorYear: number;
  anchorYearDays: PrayerDay[];
  previousYearDays: PrayerDay[] | undefined;
  nextYearDays: PrayerDay[] | undefined;
}): HijriMonthMergeResult | { status: "date-not-found" } {
  const { referenceDate, anchorYear, anchorYearDays, previousYearDays, nextYearDays } = params;

  const referenceDay = anchorYearDays.find((d) => d.date === referenceDate);
  if (!referenceDay) {
    return { status: "date-not-found" };
  }

  const { year: hijriYear, month: hijriMonth } = referenceDay.hijri;
  const matching = anchorYearDays
    .filter((d) => d.hijri.year === hijriYear && d.hijri.month === hijriMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  const jan1 = `${anchorYear}-01-01`;
  const dec31 = `${anchorYear}-12-31`;
  // A Hijri day of 1 is proof, straight from the data, that the month
  // genuinely starts here — no neighbour lookup needed even if this also
  // happens to be the file's own first day. There is no equivalent proof
  // for "the month genuinely ends here", since a Hijri month's length (29
  // or 30) isn't something this site is allowed to compute — so the end
  // boundary always has to check the adjoining file when it lands on the
  // file's own last day.
  const touchesStart = matching[0]!.date === jan1 && matching[0]!.hijri.day !== 1;
  const touchesEnd = matching[matching.length - 1]!.date === dec31;

  const missing: ("start" | "end")[] = [];
  let merged = matching;

  if (touchesStart) {
    if (previousYearDays === undefined) {
      missing.push("start");
    } else {
      const fromPrevious = previousYearDays
        .filter((d) => d.hijri.year === hijriYear && d.hijri.month === hijriMonth)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (fromPrevious.length > 0) {
        merged = [...fromPrevious, ...merged];
      } else {
        // The file exists but has no trailing days for this Hijri month —
        // inconsistent with matching[0] not being day 1, so treat it the
        // same as genuinely missing rather than silently accepting a
        // truncated view.
        missing.push("start");
      }
    }
  }

  if (touchesEnd) {
    if (nextYearDays === undefined) {
      missing.push("end");
    } else {
      const fromNext = nextYearDays
        .filter((d) => d.hijri.year === hijriYear && d.hijri.month === hijriMonth)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (fromNext.length > 0) {
        merged = [...merged, ...fromNext];
      }
      // Zero matches means the file was checked and simply has no more days
      // of this Hijri month — the month legitimately ended at this file's
      // last day, not a gap.
    }
  }

  return { status: "ok", days: merged, complete: missing.length === 0, missing };
}
