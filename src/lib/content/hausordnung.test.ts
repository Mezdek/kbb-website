import { describe, expect, it } from "vitest";
import { getAvailableHausordnungLanguages, resolveHausordnungLanguage } from "./hausordnung";
import { HAUSORDNUNG_LANGUAGES } from "./hausordnungLanguages";

describe("getAvailableHausordnungLanguages", () => {
  it("offers every canonical language, since each has a content file", () => {
    const available = getAvailableHausordnungLanguages();
    expect(available.map((language) => language.code).sort()).toEqual(
      HAUSORDNUNG_LANGUAGES.map((language) => language.code).sort(),
    );
  });

  it("omits a language whose content file is absent", () => {
    const available = getAvailableHausordnungLanguages([
      ...HAUSORDNUNG_LANGUAGES,
      { code: "xx", endonym: "Xxxx" },
    ]);
    expect(available.some((language) => language.code === "xx")).toBe(false);
  });

  it("returns nothing when none of the given languages have a file", () => {
    const available = getAvailableHausordnungLanguages([{ code: "xx", endonym: "Xxxx" }]);
    expect(available).toEqual([]);
  });

  it("attaches the correct text direction to each language (ar and fa are rtl)", () => {
    const available = getAvailableHausordnungLanguages();
    const byCode = Object.fromEntries(available.map((language) => [language.code, language.dir]));
    expect(byCode.ar).toBe("rtl");
    expect(byCode.fa).toBe("rtl");
    expect(byCode.de).toBe("ltr");
    expect(byCode.en).toBe("ltr");
    expect(byCode.tr).toBe("ltr");
    expect(byCode.ru).toBe("ltr");
    expect(byCode.id).toBe("ltr");
  });
});

describe("resolveHausordnungLanguage", () => {
  const available = getAvailableHausordnungLanguages();

  it("accepts a language that is available", () => {
    expect(resolveHausordnungLanguage("fa", available)).toBe("fa");
  });

  it("rejects a language that is not available (unknown value)", () => {
    expect(resolveHausordnungLanguage("xx", available)).toBeUndefined();
  });

  it("returns undefined when no value is given", () => {
    expect(resolveHausordnungLanguage(undefined, available)).toBeUndefined();
  });
});
