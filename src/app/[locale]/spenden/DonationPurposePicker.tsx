"use client";

import { useMemo, useState } from "react";
import { buildEpcPayload } from "@/lib/donations/epcQr";
import { renderQrSvgMarkup } from "@/lib/donations/qrSvg";
import { Ltr } from "@/components/Ltr";

export interface DonationPurpose {
  id: string;
  name: string;
  description: string;
  verwendungszweck: string;
}

export interface DonationBankInfo {
  accountHolder: string;
  iban: string;
  bic: string;
  bankName: string;
}

export interface DonationLabels {
  step1Heading: string;
  step2Heading: string;
  recipient: string;
  iban: string;
  bic: string;
  bank: string;
  verwendungszweckLabel: string;
  giroCodeInstruction: string;
  selectedLabel: string;
}

function formatIban(iban: string): string {
  return iban
    .replace(/\s+/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/**
 * Client Component: selecting a purpose derives both the displayed
 * Verwendungszweck text and the GiroCode payload from the same
 * `purposes[selectedId]` lookup in the same render, so the two can never
 * drift apart — the donor's bank transfer reference is guaranteed to match
 * what the QR code actually encodes.
 */
export function DonationPurposePicker({
  purposes,
  bank,
  recipientName,
  labels,
}: {
  purposes: DonationPurpose[];
  bank: DonationBankInfo;
  recipientName: string;
  labels: DonationLabels;
}) {
  const [selectedId, setSelectedId] = useState(purposes[0]?.id ?? "");
  const selected = purposes.find((purpose) => purpose.id === selectedId) ?? purposes[0]!;

  const qrSvg = useMemo(() => {
    const payload = buildEpcPayload({
      bic: bank.bic,
      accountHolder: bank.accountHolder,
      iban: bank.iban,
      verwendungszweck: selected.verwendungszweck,
    });
    return renderQrSvgMarkup(payload);
  }, [bank, selected.verwendungszweck]);

  return (
    <div className="flex flex-col gap-7 md:gap-8">
      <div>
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
          {labels.step1Heading}
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-3">
          {purposes.map((purpose) => {
            const isSelected = purpose.id === selectedId;
            return (
              <button
                key={purpose.id}
                type="button"
                onClick={() => setSelectedId(purpose.id)}
                aria-pressed={isSelected}
                className={`px-4.5 py-4 text-start ${
                  isSelected
                    ? "border-2 border-primary bg-primary text-secondary-shade-2"
                    : "border border-secondary/60 text-primary"
                }`}
              >
                <div className="mb-1 text-lg">{purpose.name}</div>
                <div
                  className={`text-sm leading-[1.55] ${
                    isSelected ? "text-secondary-shade-2/80" : "text-text-secondary"
                  }`}
                >
                  {purpose.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 md:hidden">
          {purposes.map((purpose) => {
            const isSelected = purpose.id === selectedId;
            return (
              <button
                key={purpose.id}
                type="button"
                onClick={() => setSelectedId(purpose.id)}
                aria-pressed={isSelected}
                className={`flex min-h-11 items-center justify-between px-4 py-3.5 text-start text-base ${
                  isSelected
                    ? "bg-primary text-secondary-shade-2"
                    : "border border-secondary/60 text-primary"
                }`}
              >
                <span>{purpose.name}</span>
                {isSelected && (
                  <span className="text-sm text-secondary-shade-1">{labels.selectedLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid border border-primary md:grid-cols-[1fr_300px] rtl:md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-4 px-5 py-6 md:px-7 md:py-7 md:rtl:order-2">
          <div className="text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
            {labels.step2Heading}
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.1em] text-text-secondary">
              {labels.recipient}
            </div>
            <Ltr className="block text-lg text-text-body">{recipientName}</Ltr>
          </div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.1em] text-text-secondary">
              {labels.iban}
            </div>
            <Ltr className="block text-[22px] tracking-[0.04em] text-primary">
              {formatIban(bank.iban)}
            </Ltr>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-10">
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-text-secondary">
                {labels.bic}
              </div>
              <Ltr className="block text-lg text-text-body">{bank.bic}</Ltr>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-text-secondary">
                {labels.bank}
              </div>
              <Ltr className="block text-lg text-text-body">{bank.bankName}</Ltr>
            </div>
          </div>
          <div className="border-s-[3px] border-flair-shade-2 px-4 py-3.5">
            <div className="mb-1 text-xs uppercase tracking-[0.1em] text-text-secondary">
              {labels.verwendungszweckLabel}
            </div>
            <Ltr className="block text-xl text-flair-shade-2">{selected.verwendungszweck}</Ltr>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3.5 bg-secondary/13 px-6 py-7 text-center md:rtl:order-1">
          <div
            className="h-[170px] w-[170px] shrink-0"
            role="img"
            aria-label="GiroCode"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="text-sm leading-[1.55] text-text-secondary">{labels.giroCodeInstruction}</p>
        </div>
      </div>
    </div>
  );
}
