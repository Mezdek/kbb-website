import { describe, expect, it } from "vitest";
import { getPrayerTimesForHijriMonth } from "./loader";

describe("getPrayerTimesForHijriMonth (integration, real dev-fixture files)", () => {
  it("merges Hijri month 7/1448 across the committed 2026 and 2027 fixtures", () => {
    // content/prayer-times/2026/times.json ends the year at hijri 7/1448/22;
    // content/prayer-times/2027/times.json picks the same month up at day 23
    // on 2027-01-01. Both files are committed dev fixtures, so this exercises
    // the real loader + real merge end to end, not just the pure function.
    const result = getPrayerTimesForHijriMonth("2026-12-30");

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("unreachable");
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.days[0]!.hijri).toEqual({ day: 1, month: 7, year: 1448 });
    expect(result.days.at(-1)!.hijri.month).toBe(7);
    // Spans the Gregorian year boundary.
    expect(result.days.some((d) => d.date.startsWith("2026-"))).toBe(true);
    expect(result.days.some((d) => d.date.startsWith("2027-"))).toBe(true);
    // No gaps: every day in the range is consecutive.
    const dates = result.days.map((d) => d.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("returns not-uploaded for a year with no file at all", () => {
    const result = getPrayerTimesForHijriMonth("2099-06-15");
    expect(result.status).toBe("not-uploaded");
  });

  it("returns date-not-found for a date absent from an existing year file", () => {
    const result = getPrayerTimesForHijriMonth("2026-02-30"); // not a real calendar date
    expect(result.status).toBe("date-not-found");
  });
});
