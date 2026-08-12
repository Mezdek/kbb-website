import { describe, expect, it } from "vitest";
import { isRtlLanguage, resolveLocalized } from "./localized";

describe("isRtlLanguage", () => {
  it("recognises RTL languages", () => {
    for (const lang of ["ar", "he", "fa", "ur", "ps", "sd", "yi", "ckb"]) {
      expect(isRtlLanguage(lang), lang).toBe(true);
    }
  });

  it("treats everything else as LTR", () => {
    for (const lang of ["de", "en", "tr", "ru", "id", "fr", ""]) {
      expect(isRtlLanguage(lang), lang).toBe(false);
    }
  });

  it("is case-sensitive — codes are lowercase everywhere in this codebase", () => {
    expect(isRtlLanguage("AR")).toBe(false);
  });
});

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

  it("prefers the fallback locale over an arbitrary entry", () => {
    const result = resolveLocalized({ tr: "Cami", en: "Mosque", ru: "Мечеть" }, "ar");
    expect(result.lang).toBe("en");
  });

  it("reports the language actually chosen, not the one requested", () => {
    const result = resolveLocalized({ fa: "مسجد" }, "de");
    expect(result).toEqual({ text: "مسجد", lang: "fa", dir: "rtl" });
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
