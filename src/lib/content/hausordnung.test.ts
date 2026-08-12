import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The loader reads the content directory once at module load, so there is no
 * injectable language list any more. Cases that depend on which files exist
 * are exercised by mocking `node:fs` and re-importing the module; the rest
 * run against the real `content/hausordnung` directory.
 */
async function loadWith(files: string[]) {
  vi.resetModules();
  vi.doMock("node:fs", () => ({
    default: {
      readdirSync: () => files,
      readFileSync: (filePath: string) => `# ${filePath}`,
    },
  }));
  return import("./hausordnung");
}

afterEach(() => {
  vi.doUnmock("node:fs");
  vi.resetModules();
});

describe("HAUSORDNUNG_DOCUMENTS", () => {
  it("offers exactly the languages that have a Markdown file", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await loadWith(["de.md", "ar.md", "tr.md"]);
    expect(HAUSORDNUNG_DOCUMENTS.map((document) => document.code)).toEqual(["ar", "de", "tr"]);
  });

  it("ignores files that are not Markdown", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await loadWith(["de.md", "README.txt", ".DS_Store"]);
    expect(HAUSORDNUNG_DOCUMENTS.map((document) => document.code)).toEqual(["de"]);
  });

  it("offers nothing when the directory is empty", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await loadWith([]);
    expect(HAUSORDNUNG_DOCUMENTS).toEqual([]);
  });

  it("offers a language with no entry in the canonical set, named by its code", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await loadWith(["de.md", "ckb.md"]);
    expect(HAUSORDNUNG_DOCUMENTS.map((document) => document.code)).toContain("ckb");
  });

  it("attaches the text direction of each language", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await loadWith(["ar.md", "fa.md", "de.md", "en.md"]);
    const dirByCode = Object.fromEntries(
      HAUSORDNUNG_DOCUMENTS.map((document) => [document.code, document.dir]),
    );
    expect(dirByCode).toEqual({ ar: "rtl", fa: "rtl", de: "ltr", en: "ltr" });
  });

  it("uses the real content directory", async () => {
    const { HAUSORDNUNG_DOCUMENTS } = await import("./hausordnung");
    expect(HAUSORDNUNG_DOCUMENTS.length).toBeGreaterThan(0);
    expect(HAUSORDNUNG_DOCUMENTS.map((document) => document.code)).toContain("de");
  });
});

describe("resolveHausordnungLanguage", () => {
  it("accepts a language that has a file", async () => {
    const { resolveHausordnungLanguage } = await loadWith(["de.md", "fa.md"]);
    expect(resolveHausordnungLanguage("fa")).toBe("fa");
  });

  it("rejects a language that has no file", async () => {
    const { resolveHausordnungLanguage } = await loadWith(["de.md"]);
    expect(resolveHausordnungLanguage("xx")).toBeUndefined();
  });

  it("returns undefined for an absent value", async () => {
    const { resolveHausordnungLanguage } = await loadWith(["de.md"]);
    expect(resolveHausordnungLanguage(undefined)).toBeUndefined();
  });

  it("returns undefined for an empty string", async () => {
    const { resolveHausordnungLanguage } = await loadWith(["de.md"]);
    expect(resolveHausordnungLanguage("")).toBeUndefined();
  });
});

describe("readHausordnungDocument", () => {
  it("returns the file contents", async () => {
    const { readHausordnungDocument } = await loadWith(["de.md"]);
    expect(readHausordnungDocument("de")).toContain("de.md");
  });

  it("throws for a language with no file, rather than returning empty", async () => {
    const { readHausordnungDocument } = await loadWith(["de.md"]);
    expect(() => readHausordnungDocument("xx")).toThrow(/xx/);
  });
});
