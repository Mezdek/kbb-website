import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../../schemas/announcement.schema.json";
import { filterByCategory, getAnnouncements, getOccurringCategories } from "./announcements";

const NOW = new Date("2026-08-09T00:00:00Z");

describe("sample content files", () => {
  it("all validate against announcement.schema.json", () => {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    const dir = path.join(process.cwd(), "content", "announcements");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
      const valid = validate(parsed);
      expect(valid, `${file}: ${ajv.errorsText(validate.errors)}`).toBe(true);
    }
  });
});

describe("getAnnouncements", () => {
  it("sorts pinned-and-current items first, then by publishDate descending", () => {
    const items = getAnnouncements(NOW);

    // Both eid-al-adha-2026 (pinnedUntil 2026-08-21) and tarawih-ramadan-2026
    // (pinnedUntil 2027-02-18) are still pinned relative to NOW, so both sort
    // ahead of every non-pinned item; between the two, the more recently
    // published one (eid, Aug 15) sorts first.
    expect(items[0]!.slug).toBe("eid-al-adha-2026");
    expect(items[1]!.slug).toBe("tarawih-ramadan-2026");

    const verInIndex = items.findIndex((a) => a.slug === "mitgliederversammlung-2026");
    expect(verInIndex).toBeGreaterThan(1);

    const nonPinned = items.filter(
      (a) => !["tarawih-ramadan-2026", "eid-al-adha-2026"].includes(a.slug),
    );
    for (let i = 1; i < nonPinned.length; i++) {
      expect(new Date(nonPinned[i - 1]!.publishDate).getTime()).toBeGreaterThanOrEqual(
        new Date(nonPinned[i]!.publishDate).getTime(),
      );
    }
  });

  it("does not treat an item as pinned once pinnedUntil has passed", () => {
    const farFuture = new Date("2027-06-01T00:00:00Z");
    const items = getAnnouncements(farFuture);
    // Both pinnedUntil dates (2026-08-21, 2027-02-18) are in the past by now.
    expect(items[0]!.slug).not.toBe("tarawih-ramadan-2026");
  });
});

describe("getOccurringCategories", () => {
  it("only returns categories present in the given set, including untranslated ones", () => {
    const categories = getOccurringCategories(getAnnouncements(NOW));
    expect(categories).toContain("ramadan");
    expect(categories).toContain("verein");
    expect(categories).toContain("unterricht");
    expect(categories).toContain("jugend-freizeit");
    expect(categories).not.toContain("does-not-exist");
  });
});

describe("filterByCategory", () => {
  it("filters to only the requested category", () => {
    const all = getAnnouncements(NOW);
    const filtered = filterByCategory(all, "verein");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((a) => a.category === "verein")).toBe(true);
  });

  it("returns everything when no category is given", () => {
    const all = getAnnouncements(NOW);
    expect(filterByCategory(all, undefined)).toHaveLength(all.length);
  });
});
