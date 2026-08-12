import { describe, expect, it } from "vitest";
import { gregorianModeSeparatorDates, hijriModeSeparatorDates } from "./separators";
import type { PrayerDay } from "./types";

const TIME_FIELDS = { fajr: "04:00", shuruq: "06:00", dhuhr: "13:00", asr: "17:00", maghrib: "20:00", isha: "22:00" };

function day(date: string, hijriDay: number, hijriMonth: number): PrayerDay {
  return { date, ...TIME_FIELDS, hijri: { day: hijriDay, month: hijriMonth, year: 1448 } };
}

describe("gregorianModeSeparatorDates", () => {
  it("marks the date a new Hijri month begins, not the first row", () => {
    const days = [
      day("2026-06-09", 29, 3),
      day("2026-06-10", 1, 4), // new Hijri month starts here
      day("2026-06-11", 2, 4),
    ];
    expect(gregorianModeSeparatorDates(days)).toEqual(new Set(["2026-06-10"]));
  });

  it("does not mark the first row even if it is Hijri day 1", () => {
    const days = [day("2026-06-10", 1, 4), day("2026-06-11", 2, 4)];
    expect(gregorianModeSeparatorDates(days)).toEqual(new Set());
  });

  it("returns an empty set when no Hijri month boundary occurs", () => {
    const days = [day("2026-06-10", 5, 4), day("2026-06-11", 6, 4)];
    expect(gregorianModeSeparatorDates(days)).toEqual(new Set());
  });
});

describe("hijriModeSeparatorDates", () => {
  it("marks the date a new Gregorian month begins, not the first row", () => {
    const days = [
      day("2026-12-31", 22, 7),
      day("2027-01-01", 23, 7), // new Gregorian month starts here
      day("2027-01-02", 24, 7),
    ];
    expect(hijriModeSeparatorDates(days)).toEqual(new Set(["2027-01-01"]));
  });

  it("does not mark the first row even if it is the 1st of the month", () => {
    const days = [day("2027-01-01", 23, 7), day("2027-01-02", 24, 7)];
    expect(hijriModeSeparatorDates(days)).toEqual(new Set());
  });

  it("marks every Gregorian month boundary crossed within a Hijri month", () => {
    const days = [day("2026-05-31", 13, 3), day("2026-06-01", 14, 3), day("2026-06-30", 15, 3), day("2026-07-01", 16, 3)];
    expect(hijriModeSeparatorDates(days)).toEqual(new Set(["2026-06-01", "2026-07-01"]));
  });
});
