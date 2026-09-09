/** Two overlapping sheets — the generic "copy" glyph, as a single filled
 * path. Uses currentColor so it still follows CopyButton's hover/color
 * states. */
export function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-2 -2 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 2a2 2 0 00-2 2v9a2 2 0 002 2h2v2a2 2 0 002 2h9a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H4zm9 4V4H4v9h2V8a2 2 0 012-2h5zM8 8h9v9H8V8z"
      />
    </svg>
  );
}
