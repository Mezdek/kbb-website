import { describe, expect, it } from "vitest";
import { formatDuration, formatNumeral, timeToMinutes, withNativeNumerals } from "./date";

describe("timeToMinutes", () => {
  it("converts HH:MM to minutes since midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("03:41")).toBe(221);
    expect(timeToMinutes("23:59")).toBe(1439);
  });
});

describe("withNativeNumerals", () => {
  it("appends the Arabic-Indic numbering extension only for Arabic", () => {
    expect(withNativeNumerals("ar")).toBe("ar-u-nu-arab");
    expect(withNativeNumerals("de")).toBe("de");
    expect(withNativeNumerals("en")).toBe("en");
  });
});

describe("formatNumeral", () => {
  it("renders Eastern Arabic digits for ar, Western digits otherwise", () => {
    expect(formatNumeral(2026, "ar")).toBe("٢٠٢٦");
    expect(formatNumeral(2026, "de")).toBe("2026");
    expect(formatNumeral(2026, "en")).toBe("2026");
  });
});

describe("formatDuration", () => {
  it("formats German with Std/Min", () => {
    expect(formatDuration(210, "de")).toBe("3 Std 30 Min");
    expect(formatDuration(45, "de")).toBe("45 Min");
    expect(formatDuration(0, "de")).toBe("0 Min");
  });

  it("formats English with h/m", () => {
    expect(formatDuration(210, "en")).toBe("3h 30m");
    expect(formatDuration(45, "en")).toBe("45m");
  });

  it("formats Arabic with Eastern Arabic digits and hour-word agreement", () => {
    expect(formatDuration(30, "ar")).toBe("٣٠ دقيقة");
    expect(formatDuration(60, "ar")).toBe("ساعة");
    expect(formatDuration(120, "ar")).toBe("ساعتين");
    expect(formatDuration(210, "ar")).toBe("٣ ساعات و٣٠ دقيقة");
    expect(formatDuration(720, "ar")).toBe("١٢ ساعة");
  });
});
