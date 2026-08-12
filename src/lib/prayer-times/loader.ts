import fs from "node:fs";
import path from "node:path";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../../schemas/prayer-times.schema.json";
import { getSiteConfig } from "../config";
import { getBerlinDateParts } from "../date";
import type {
  PrayerDay,
  PrayerDayResult,
  PrayerHijriMonthResult,
  PrayerMonthResult,
} from "./types";
import { resolveHijriMonth } from "./hijriMonth";
import { PrayerTimes } from "@/types/prayer-times.schema";

let validator: ValidateFunction<PrayerTimes> | undefined;

function getValidator(): ValidateFunction<PrayerTimes> {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    validator = ajv.compile<PrayerTimes>(schema);
  }
  return validator;
}

function resolveYearFilePath(year: number): string {
  const config = getSiteConfig();
  // Intentionally opted out of Turbopack's build-time file tracing: this
  // path is read at runtime from wherever the separate prayer-time
  // generator writes to (CLAUDE.md: Prayer times), which can differ from
  // the build-time value and must never be bundled into the standalone
  // output as if it were a static project asset.
  const base = path.isAbsolute(config.prayerTimes.basePath)
    ? config.prayerTimes.basePath
    : path.join(process.cwd(), config.prayerTimes.basePath);
  return path.join(base, String(year), "times.json");
}

/**
 * Reads and validates `{basePath}/{year}/times.json` (CLAUDE.md: Prayer
 * times — this site only reads, it never computes). Returns `null` if the
 * file for that year simply hasn't been uploaded yet. Throws if the file
 * exists but fails schema validation — malformed content must fail loudly,
 * not render blank (CLAUDE.md: Content > Validation).
 */
function loadYearFile(year: number): PrayerTimes | null {
  const filePath = resolveYearFilePath(year);

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);
  const validate = getValidator();
  if (!validate(parsed)) {
    const details = (validate.errors ?? [])
      .map((error) => `${error.instancePath || "/"} ${error.message}`)
      .join("; ");
    throw new Error(`${filePath} failed schema validation: ${details}`);
  }

  return parsed;
}

/**
 * `days` is an object keyed by ISO date, so the individual day entries carry
 * no date of their own. Every read attaches the key back onto the value.
 */
function withDate(date: string, times: PrayerTimes["days"][string]) {
  return { date, ...times };
}

/** Days of one calendar month, in date order, each with its date attached. */
function daysInMonth(file: PrayerTimes, year: number, month: number) {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  return Object.entries(file.days)
    .filter(([date]) => date.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, times]) => withDate(date, times));
}

/** Every day in a year file, in date order, each with its date attached. */
function allDaysInFile(file: PrayerTimes): PrayerDay[] {
  return Object.entries(file.days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, times]) => withDate(date, times));
}

/**
 * Resolves the single day containing `date` plus the rest of that day's
 * calendar month, for the homepage/prayer-band "today" view. `date` is
 * interpreted in Europe/Berlin, not the server's own timezone — the deploy
 * server may run in UTC, where naively reading `date`'s own UTC calendar
 * day would resolve to the wrong day during Berlin's first two hours after
 * midnight. Never falls back to a previous year and never interpolates — a
 * missing file or a date outside it are distinct, explicit failure states
 * for the UI to render as "no times have been uploaded" (CLAUDE.md: Prayer
 * times).
 */
export function getPrayerTimesForDate(date: Date): PrayerDayResult {
  const { isoDate } = getBerlinDateParts(date);
  const [yearStr, monthStr] = isoDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const file = loadYearFile(year);
  if (!file) {
    return { status: "not-uploaded" };
  }

  const times = file.days[isoDate];
  if (!times) {
    return { status: "date-not-found" };
  }

  return {
    status: "ok",
    day: withDate(isoDate, times),
    month: daysInMonth(file, year, month),
  };
}

/**
 * Resolves every day in a given calendar month, for the full monthly table
 * page. See `getPrayerTimesForDate` for the failure-mode contract.
 */
export function getPrayerTimesForMonth(year: number, month: number): PrayerMonthResult {
  const file = loadYearFile(year);
  if (!file) {
    return { status: "not-uploaded" };
  }

  const days = daysInMonth(file, year, month);
  if (days.length === 0) {
    return { status: "date-not-found" };
  }

  return { status: "ok", days };
}

/**
 * Resolves the full Hijri month containing `referenceDate` (an ISO date),
 * for the Hijri-mode monthly table (CLAUDE.md: /moschee/gebetszeiten).
 *
 * A Hijri month can span two Gregorian year files. This always loads the
 * anchor year (the one containing `referenceDate`) plus its immediate
 * neighbours, so a month cut off at either end of the anchor file can be
 * completed from the adjoining one when it exists — see `resolveHijriMonth`
 * for the boundary/merge logic itself, which is pure and separately tested.
 * Loading both neighbours unconditionally (rather than first checking which
 * side actually needs one) costs at most two extra file reads and keeps
 * this function a thin I/O wrapper.
 */
export function getPrayerTimesForHijriMonth(referenceDate: string): PrayerHijriMonthResult {
  const anchorYear = Number(referenceDate.slice(0, 4));

  const file = loadYearFile(anchorYear);
  if (!file) {
    return { status: "not-uploaded" };
  }
  if (!file.days[referenceDate]) {
    return { status: "date-not-found" };
  }

  const previousFile = loadYearFile(anchorYear - 1);
  const nextFile = loadYearFile(anchorYear + 1);

  return resolveHijriMonth({
    referenceDate,
    anchorYear,
    anchorYearDays: allDaysInFile(file),
    previousYearDays: previousFile ? allDaysInFile(previousFile) : undefined,
    nextYearDays: nextFile ? allDaysInFile(nextFile) : undefined,
  });
}
