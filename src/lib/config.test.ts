import { describe, expect, it } from "vitest";
import { getSiteConfig } from "./config";

describe("getSiteConfig", () => {
  it("loads and validates config/site.json", () => {
    const config = getSiteConfig();
    expect(config.org.legalName).toBe("Kulturbrücke Brandenburg e.V.");
    expect(config.donations.purposes.length).toBeGreaterThan(0);
    expect(config.bank.iban.length).toBeGreaterThan(0);
  });

  it("returns the same cached instance on repeat calls", () => {
    expect(getSiteConfig()).toBe(getSiteConfig());
  });
});
