import { compiler } from "markdown-to-jsx";
import type { ReactNode } from "react";

const disabledTag = () => null;

/**
 * Renders Markdown to a limited, sanitized subset — shared by announcement
 * bodies (CLAUDE.md: Content — "Body may contain Markdown. Render a limited
 * subset. Sanitize.") and the `/moschee/hausordnung` document, rather than
 * configuring a second renderer. `compiler()` never uses
 * `dangerouslySetInnerHTML`; raw HTML in the source is disabled outright
 * (escaped as text) rather than parsed, and structural tags outside the
 * intended subset (headings, images, tables) are demoted or dropped rather
 * than rendered verbatim.
 */
export function renderMarkdown(markdown: string): ReactNode {
  return compiler(markdown, {
    disableParsingRawHTML: true,
    overrides: {
      h1: "p",
      h2: "p",
      h3: "p",
      h4: "p",
      h5: "p",
      h6: "p",
      img: disabledTag,
      table: disabledTag,
      thead: disabledTag,
      tbody: disabledTag,
      tr: disabledTag,
      td: disabledTag,
      th: disabledTag,
    },
  });
}
