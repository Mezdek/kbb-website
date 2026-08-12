import { describe, expect, it } from "vitest";
import { resolveLocalized } from "./localized";

describe("resolveLocalized", () => {
  it("picks the active locale when present", () => {
    const result = resolveLocalized({ de: "Moschee", en: "Mosque", ar: "مسجد" }, "ar");
    expect(result).toEqual({ text: "مسجد", lang: "ar", dir: "rtl" });
  });

  it("falls back to the fallback locale (en) when the active locale is absent", () => {
    const result = resolveLocalized({ de: "Moschee", en: "Mosque" }, "ar");
    expect(result).toEqual({ text: "Mosque", lang: "en", dir: "ltr" });
  });

  it("falls back to any available entry when neither the active nor the fallback locale is present", () => {
    const result = resolveLocalized({ de: "Moschee" }, "ar");
    expect(result).toEqual({ text: "Moschee", lang: "de", dir: "ltr" });
  });

  it("recognises RTL languages beyond the three UI locales", () => {
    expect(resolveLocalized({ fa: "متن" }, "de").dir).toBe("rtl");
    expect(resolveLocalized({ ur: "متن" }, "de").dir).toBe("rtl");
    expect(resolveLocalized({ he: "טקסט" }, "de").dir).toBe("rtl");
  });

  it("treats an unrecognised language key as LTR", () => {
    expect(resolveLocalized({ fr: "texte" }, "de").dir).toBe("ltr");
  });

  it("throws when the value has no entries at all", () => {
    expect(() => resolveLocalized({}, "de")).toThrow("Localized value has no entries");
  });
});
