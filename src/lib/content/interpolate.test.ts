import { describe, expect, it } from "vitest";
import { interpolate } from "./interpolate";

describe("interpolate", () => {
  it("replaces every placeholder with its value", () => {
    expect(interpolate("Hallo {{name}}, {{city}}!", { name: "Mez", city: "Brandenburg" })).toBe(
      "Hallo Mez, Brandenburg!",
    );
  });

  it("replaces repeated placeholders", () => {
    expect(interpolate("{{x}} und {{x}}", { x: "a" })).toBe("a und a");
  });

  it("leaves text with no placeholders untouched", () => {
    expect(interpolate("Kein Platzhalter hier.", {})).toBe("Kein Platzhalter hier.");
  });

  it("throws when the template references a value that was not supplied", () => {
    expect(() => interpolate("{{missing}}", {})).toThrow(/missing/);
  });

  it("throws when a supplied value is never referenced by the template", () => {
    expect(() => interpolate("no placeholders", { unused: "x" })).toThrow(/unused/);
  });

  it("does not treat a partial or malformed brace as a placeholder", () => {
    expect(interpolate("{single} and {{ok}}", { ok: "value" })).toBe("{single} and value");
  });
});
