import type { ReactNode } from "react";

/**
 * The outer content frame every page shares — full-height background plus
 * the centered, bordered "paper" surface (CLAUDE.md: Global layout —
 * "Unify the max content width across all pages"). Width and surface
 * treatment live here once instead of being retyped per page file, so a
 * page can never drift to its own one-off max-width.
 *
 * `print:shadow-none print:border-0` apply uniformly: a printed page should
 * never show the on-screen "card" chrome around its content, whether or not
 * that particular page has its own print button.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1400px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] print:border-0 print:shadow-none md:border md:border-secondary/60">
        {children}
      </div>
    </div>
  );
}
