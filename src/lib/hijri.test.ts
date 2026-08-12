import { describe, expect, it } from "vitest";
import { formatHijriDate, formatHijriNumeral, hijriMonthSlug, HIJRI_MONTH_SLUGS } from "./hijri";

describe("hijriMonthSlug", () => {
  it("maps month 1 to muharram and month 12 to dhu-al-hijjah", () => {
    expect(hijriMonthSlug(1)).toBe("muharram");
    expect(hijriMonthSlug(12)).toBe("dhu-al-hijjah");
  });

  it("has exactly 12 slugs, one per Hijri month", () => {
    expect(HIJRI_MONTH_SLUGS).toHaveLength(12);
  });

  it("throws on a month outside 1-12", () => {
    expect(() => hijriMonthSlug(0)).toThrow("Invalid Hijri month: 0");
    expect(() => hijriMonthSlug(13)).toThrow("Invalid Hijri month: 13");
  });
});

describe("formatHijriNumeral", () => {
  it("renders Western digits for non-Arabic locales", () => {
    expect(formatHijriNumeral(13, "de")).toBe("13");
    expect(formatHijriNumeral(1448, "en")).toBe("1448");
  });

  it("renders Eastern Arabic digits for Arabic", () => {
    expect(formatHijriNumeral(13, "ar")).toBe("١٣");
  });
});

describe("formatHijriDate", () => {
  const hijri = { day: 13, month: 7, year: 1448 };

  it("uses a German-style 'day. month year' format for de", () => {
    expect(formatHijriDate(hijri, "Rajab", "de")).toBe("13. Rajab 1448");
  });

  it("omits the period for non-German locales", () => {
    expect(formatHijriDate(hijri, "Rajab", "en")).toBe("13 Rajab 1448");
  });

  it("renders the day and year in Eastern Arabic numerals for ar", () => {
    expect(formatHijriDate(hijri, "رجب", "ar")).toBe("١٣ رجب ١٤٤٨");
  });
});
