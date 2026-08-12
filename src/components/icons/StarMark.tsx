/**
 * The eight-pointed star (rub el hizb) — the association's fixed mark. Two
 * overlapping squares, stroke only, no fill: the header logo and the
 * default category icon share this exact shape.
 */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="7">
        <rect x="18" y="18" width="64" height="64" />
        <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" />
      </g>
    </svg>
  );
}
