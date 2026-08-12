"use client";

import type { ReactNode } from "react";
import { BUTTON_VARIANT_CLASSES, type ButtonVariant } from "./Button";

/**
 * Both "print the table" and "download as PDF" resolve to the browser's
 * own print dialog (which offers "Save as PDF") — a real, working
 * printable-A4 table without a server-side PDF generation dependency that
 * was never discussed or approved.
 */
export function PrintButton({
  children,
  variant = "utility",
  className = "",
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${BUTTON_VARIANT_CLASSES[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
