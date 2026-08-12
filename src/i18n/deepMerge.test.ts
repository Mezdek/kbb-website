import { describe, expect, it } from "vitest";
import { deepMerge } from "./deepMerge";

describe("deepMerge", () => {
  it("keeps keys present only in the base (English) object", () => {
    const base = { a: "english-a", b: "english-b" };
    const override = { a: "locale-a" };
    expect(deepMerge(base, override)).toEqual({ a: "locale-a", b: "english-b" });
  });

  it("lets the override value win when a key exists in both", () => {
    const base = { greeting: "Hello" };
    const override = { greeting: "Hallo" };
    expect(deepMerge(base, override)).toEqual({ greeting: "Hallo" });
  });

  it("merges nested objects key by key rather than replacing the whole subtree", () => {
    const base = { nav: { home: "Home", about: "About", contact: "Contact" } };
    const override = { nav: { home: "Startseite" } };
    expect(deepMerge(base, override)).toEqual({
      nav: { home: "Startseite", about: "About", contact: "Contact" },
    });
  });

  it("does not mutate either input", () => {
    const base = { a: { x: "1" } };
    const override = { a: { y: "2" } };
    const baseSnapshot = JSON.parse(JSON.stringify(base));
    const overrideSnapshot = JSON.parse(JSON.stringify(override));

    deepMerge(base, override);

    expect(base).toEqual(baseSnapshot);
    expect(override).toEqual(overrideSnapshot);
  });
});
