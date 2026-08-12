import { describe, expect, it } from "vitest";
import { buildEpcPayload } from "./epcQr";
import { renderQrSvgMarkup } from "./qrSvg";

describe("renderQrSvgMarkup", () => {
  const payload = buildEpcPayload({
    bic: "WELADED1PMB",
    accountHolder: "Kulturbrücke Brandenburg e.V.",
    iban: "DE12345678901234567890",
    verwendungszweck: "ZAKAT 2026",
  });

  it("produces a well-formed SVG string", () => {
    const svg = renderQrSvgMarkup(payload);
    expect(svg).toMatch(/^<svg viewBox="0 0 \d+ \d+"/);
    expect(svg).toContain("<path d=\"M");
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("is deterministic for the same payload", () => {
    expect(renderQrSvgMarkup(payload)).toBe(renderQrSvgMarkup(payload));
  });

  it("produces a different matrix for a different payload", () => {
    const otherPayload = buildEpcPayload({
      bic: "WELADED1PMB",
      accountHolder: "Kulturbrücke Brandenburg e.V.",
      iban: "DE12345678901234567890",
      verwendungszweck: "SADAQA 2026",
    });
    expect(renderQrSvgMarkup(payload)).not.toBe(renderQrSvgMarkup(otherPayload));
  });

  it("respects custom module/background colors", () => {
    const svg = renderQrSvgMarkup(payload, { moduleColor: "#111111", backgroundColor: "#eeeeee" });
    expect(svg).toContain("fill:#eeeeee");
    expect(svg).toContain("fill:#111111");
  });

  it("defaults to the theme's CSS custom properties, not a hardcoded hex", () => {
    const svg = renderQrSvgMarkup(payload);
    expect(svg).toContain("fill:var(--color-text-body)");
    expect(svg).toContain("fill:var(--color-secondary-shade-2)");
  });
});
