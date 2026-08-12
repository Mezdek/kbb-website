/** Flat, stroke-only globe — matches the site's line-mark style (StarMark). */
export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="7">
        <circle cx="50" cy="50" r="38" />
        <ellipse cx="50" cy="50" rx="16" ry="38" />
        <path d="M12 50h76" />
      </g>
    </svg>
  );
}
