import { compiler } from "markdown-to-jsx/react";
import type { ReactNode } from "react";

const disabledTag = () => null;

/**
 * Renders Markdown to a limited, sanitized subset — shared by announcement
 * bodies (CLAUDE.md: Content) and the `/moschee/hausordnung` document,
 * rather than configuring a second renderer.
 *
 * Imported from `markdown-to-jsx/react`: the root entry point's React code
 * is deprecated in v9 and will be removed in a future major.
 *
 * `compiler()` never uses `dangerouslySetInnerHTML`. Raw HTML in the source
 * is disabled outright rather than parsed, `tagfilter` (on by default)
 * escapes script/iframe/style separately, and structural tags outside the
 * intended subset are demoted or dropped.
 *
 * `allowHeadings` is off by default because an announcement body sits
 * inside a card whose headings would compete with the page's own. Long
 * documents pass `true` and get their headings shifted down one level, so
 * a `#` becomes an `h2` under the page's existing `h1` rather than a
 * second `h1`.
 */
export function renderMarkdown(markdown: string): ReactNode {
  return compiler(markdown, {
    disableParsingRawHTML: true,
    // Require the space in `# Heading`, as the markdown specs state. Without
    // this the compiler is lenient about it, which makes malformed headings
    // fail silently instead of visibly.
    enforceAtxHeadings: true,
    overrides: {
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
