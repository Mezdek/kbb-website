import type { ReactNode } from "react";

/**
 * Wraps content that must stay Latin-script and left-to-right even inside
 * an Arabic (RTL) page — the registered name, times, IBAN (CLAUDE.md:
 * Design; Absolute rules). Single place for this decision instead of ad hoc
 * `dir="ltr"` attributes scattered per call site.
 */
export function Ltr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`font-latin ${className}`.trim()}>
      {children}
    </span>
  );
}
