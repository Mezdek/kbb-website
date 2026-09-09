"use client";

import { useEffect, useState } from "react";
import { CopyIcon } from "./icons/CopyIcon";

/**
 * A small icon button that copies `value` to the clipboard — used next to
 * bank-transfer fields (Spenden) and contact fields (Kontakt) so the donor
 * or visitor doesn't have to select-and-copy by hand. `copyLabel`/
 * `copiedLabel` are passed in translated rather than looked up here, so
 * this stays usable from any page regardless of its message namespace;
 * `fieldLabel` is the field's own (already-translated) label, reused to
 * build the accessible name ("Copy IBAN") rather than inventing a second
 * copy of it.
 */
export function CopyButton({
  value,
  fieldLabel,
  copyLabel,
  copiedLabel,
  className = "",
}: {
  value: string;
  fieldLabel: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — this is
      // a convenience action, not worth surfacing an error for.
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${copyLabel} ${fieldLabel}`}
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-primary ${className}`}
      >
        <CopyIcon className="h-4 w-4" />
      </button>
      {copied && (
        <span aria-live="polite" className="text-xs text-text-secondary">
          {copiedLabel}
        </span>
      )}
    </span>
  );
}
