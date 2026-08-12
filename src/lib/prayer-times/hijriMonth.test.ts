import { describe, expect, it } from "vitest";
import { resolveHijriMonth } from "./hijriMonth";
import type { PrayerDay } from "./types";

const TIME_FIELDS = { fajr: "04:00", shuruq: "06:00", dhuhr: "13:00", asr: "17:00", maghrib: "20:00", isha: "22:00" };

function day(date: string, hijriDay: number, hijriMonth: number, hijriYear = 1448): PrayerDay {
  return { date, ...TIME_FIELDS, hijri: { day: hijriDay, month: hijriMonth, year: hijriYear } };
}

describe("resolveHijriMonth", () => {
  it("returns a complete month wholly inside one Gregorian year", () => {
    const anchorYearDays = [
      day("2026-06-10", 29, 3),
      day("2026-06-11", 1, 4),
      day("2026-06-12", 2, 4),
      day("2026-06-13", 3, 4),
      day("2026-06-14", 4, 4),
    ];

    const result = resolveHijriMonth({
      referenceDate: "2026-06-12",
      anchorYear: 2026,
      anchorYearDays,
      previousYearDays: undefined,
      nextYearDays: undefined,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.days.map((d) => d.date)).toEqual(["2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14"]);
  });

  it("merges in the next year when the month crosses into a year that exists", () => {
    const anchorYearDays = [
      day("2026-12-29", 20, 7),
      day("2026-12-30", 21, 7),
      day("2026-12-31", 22, 7),
    ];
    const nextYearDays = [
      day("2027-01-01", 23, 7),
      day("2027-01-02", 24, 7),
      day("2027-01-03", 25, 7),
    ];

    const result = resolveHijriMonth({
      referenceDate: "2026-12-30",
      anchorYear: 2026,
      anchorYearDays,
      previousYearDays: undefined,
      nextYearDays,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.days.map((d) => d.date)).toEqual([
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
  });

  it("renders a partial view when the month crosses into a year that does not exist", () => {
    const anchorYearDays = [
      day("2026-12-29", 20, 7),
      day("2026-12-30", 21, 7),
      day("2026-12-31", 22, 7),
    ];

    const result = resolveHijriMonth({
      referenceDate: "2026-12-30",
      anchorYear: 2026,
      anchorYearDays,
      previousYearDays: undefined,
      nextYearDays: undefined, // that file has not been uploaded
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(false);
    expect(result.missing).toEqual(["end"]);
    // Still renders every day that *does* exist — never falls back, never
    // interpolates, just stops where the data stops.
    expect(result.days.map((d) => d.date)).toEqual(["2026-12-29", "2026-12-30", "2026-12-31"]);
  });

  it("mirror case: renders a partial view when the gap is at the start", () => {
    // The file's own data for this Hijri month starts at day 3, not day 1 —
    // proof (straight from the data) that earlier days exist somewhere,
    // namely the previous Gregorian year's file.
    const anchorYearDays = [
      day("2027-01-01", 3, 8),
      day("2027-01-02", 4, 8),
      day("2027-01-03", 5, 8),
    ];

    const result = resolveHijriMonth({
      referenceDate: "2027-01-02",
      anchorYear: 2027,
      anchorYearDays,
      previousYearDays: undefined, // 2026 has not been uploaded
      nextYearDays: undefined,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(false);
    expect(result.missing).toEqual(["start"]);
    expect(result.days.map((d) => d.date)).toEqual(["2027-01-01", "2027-01-02", "2027-01-03"]);
  });

  it("does not report a start gap when the month genuinely starts on the file's first day", () => {
    // matching[0] is both the file's first day *and* Hijri day 1 — a real
    // boundary coincidence, not a cut-off month. Must not report "missing"
    // even though the previous year was never uploaded.
    const anchorYearDays = [day("2027-01-01", 1, 8), day("2027-01-02", 2, 8)];

    const result = resolveHijriMonth({
      referenceDate: "2027-01-01",
      anchorYear: 2027,
      anchorYearDays,
      previousYearDays: undefined,
      nextYearDays: undefined,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("does not report an end gap when the adjoining file exists but simply has no more days of this month", () => {
    const anchorYearDays = [day("2026-12-30", 28, 7), day("2026-12-31", 29, 7)];
    const nextYearDays = [day("2027-01-01", 1, 8)]; // a new Hijri month — 7/1448 really did end here

    const result = resolveHijriMonth({
      referenceDate: "2026-12-31",
      anchorYear: 2026,
      anchorYearDays,
      previousYearDays: undefined,
      nextYearDays,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.days.map((d) => d.date)).toEqual(["2026-12-30", "2026-12-31"]);
  });

  it("fills the start gap from a previous year that does exist", () => {
    // This file's own data for the target Hijri month (8/1448) starts at
    // day 2 — day 1 fell on the last day of the previous Gregorian year.
    const anchorYearDays = [
      day("2027-01-01", 2, 8),
      day("2027-01-02", 3, 8),
    ];
    const previousYearDays = [
      day("2026-12-30", 29, 7),
      day("2026-12-31", 1, 8),
    ];

    const result = resolveHijriMonth({
      referenceDate: "2027-01-01",
      anchorYear: 2027,
      anchorYearDays,
      previousYearDays,
      nextYearDays: undefined,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.days.map((d) => d.date)).toEqual(["2026-12-31", "2027-01-01", "2027-01-02"]);
  });

  it("does not attempt a merge when the month does not touch either boundary", () => {
    // Regression guard: a month sitting comfortably mid-year must never
    // trigger a neighbour lookup, even if neighbour data is supplied.
    const anchorYearDays = [day("2026-06-10", 29, 3), day("2026-06-11", 1, 4), day("2026-06-12", 2, 4)];
    const previousYearDays = [day("2025-12-31", 15, 6)];
    const nextYearDays = [day("2027-01-01", 15, 6)];

    const result = resolveHijriMonth({
      referenceDate: "2026-06-11",
      anchorYear: 2026,
      anchorYearDays,
      previousYearDays,
      nextYearDays,
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.days.map((d) => d.date)).toEqual(["2026-06-11", "2026-06-12"]);
  });

  it("returns date-not-found when the reference date is not in the anchor year's days", () => {
    const result = resolveHijriMonth({
      referenceDate: "2026-06-11",
      anchorYear: 2026,
      anchorYearDays: [],
      previousYearDays: undefined,
      nextYearDays: undefined,
    });
    expect(result.status).toBe("date-not-found");
  });
});
