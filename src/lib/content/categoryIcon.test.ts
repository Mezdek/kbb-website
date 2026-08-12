import { describe, expect, it } from "vitest";
import { resolveCategoryIconPath } from "./categoryIcon";

describe("resolveCategoryIconPath", () => {
  it("resolves a category with a matching icon file", () => {
    expect(resolveCategoryIconPath("ramadan")).toMatch(/ramadan\.svg$/);
    expect(resolveCategoryIconPath("unterricht")).toMatch(/unterricht\.svg$/);
  });

  it("falls back to default.svg for a category with no dedicated icon", () => {
    expect(resolveCategoryIconPath("verein")).toMatch(/default\.svg$/);
    expect(resolveCategoryIconPath("jugend-freizeit")).toMatch(/default\.svg$/);
  });
});
