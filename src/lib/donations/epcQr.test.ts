import { describe, expect, it } from "vitest";
import { buildEpcPayload } from "./epcQr";

describe("buildEpcPayload", () => {
  it("produces the exact 11-line EPC069-12 structure", () => {
    const payload = buildEpcPayload({
      bic: "WELADED1PMB",
      accountHolder: "Kulturbrücke Brandenburg e.V.",
      iban: "DE12 3456 7890 1234 5678 90",
      verwendungszweck: "ZAKAT 2026",
    });

    expect(payload.split("\n")).toEqual([
      "BCD",
      "002",
      "1",
      "SCT",
      "WELADED1PMB",
      "Kulturbrücke Brandenburg e.V.",
      "DE12345678901234567890",
      "",
      "",
      "",
      "ZAKAT 2026",
    ]);
  });

  it("strips spaces from the IBAN but keeps them in the account holder", () => {
    const payload = buildEpcPayload({
      bic: "WELADED1PMB",
      accountHolder: "Kulturbrücke Brandenburg e.V.",
      iban: "DE12 3456 7890 1234 5678 90",
      verwendungszweck: "SADAQA 2026",
    });
    const lines = payload.split("\n");
    expect(lines[6]).toBe("DE12345678901234567890");
    expect(lines[5]).toBe("Kulturbrücke Brandenburg e.V.");
  });

  it("truncates an overly long account holder name to 70 characters", () => {
    const longName = "A".repeat(100);
    const payload = buildEpcPayload({
      bic: "WELADED1PMB",
      accountHolder: longName,
      iban: "DE12345678901234567890",
      verwendungszweck: "SADAQA 2026",
    });
    const lines = payload.split("\n");
    expect(lines[5]).toHaveLength(70);
  });

  it("truncates an overly long remittance string to 140 characters", () => {
    const longRef = "B".repeat(200);
    const payload = buildEpcPayload({
      bic: "WELADED1PMB",
      accountHolder: "Kulturbrücke Brandenburg e.V.",
      iban: "DE12345678901234567890",
      verwendungszweck: longRef,
    });
    const lines = payload.split("\n");
    expect(lines[10]).toHaveLength(140);
  });
});
