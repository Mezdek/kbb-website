"use client";

import { useState, type ReactNode } from "react";

export function MobileNav({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="border border-secondary-shade-2/40 px-2.5 py-1.5 text-xs tracking-[0.08em] text-secondary-shade-2"
      >
        {label}
      </button>
      {open && (
        <nav className="absolute end-0 top-full z-20 mt-2 flex min-w-[200px] flex-col border border-secondary/60 bg-primary">
          {children}
        </nav>
      )}
    </div>
  );
}
