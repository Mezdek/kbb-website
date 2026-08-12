export interface EpcQrInput {
  bic: string;
  accountHolder: string;
  iban: string;
  verwendungszweck: string;
}

const MAX_NAME_LENGTH = 70;
const MAX_REMITTANCE_LENGTH = 140;

/**
 * Builds an EPC069-12 ("GiroCode") SEPA Credit Transfer payload: fixed,
 * newline-joined fields. Amount and structured-reference fields are left
 * empty — an open-amount GiroCode, standard practice for donations where
 * the donor chooses the amount. Pure function so the same payload
 * construction is shared identically between server and client renders,
 * and is directly unit-testable.
 */
export function buildEpcPayload({ bic, accountHolder, iban, verwendungszweck }: EpcQrInput): string {
  const lines = [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    accountHolder.slice(0, MAX_NAME_LENGTH),
    iban.replace(/\s+/g, ""),
    "",
    "",
    "",
    verwendungszweck.slice(0, MAX_REMITTANCE_LENGTH),
  ];
  return lines.join("\n");
}
