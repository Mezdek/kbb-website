/**
 * Fills `{{key}}` placeholders in a Markdown template with values from a
 * flat lookup — the single mechanism by which facts that live in
 * `config/site.json` (address, registry, board, contact) reach the
 * hand-authored legal and content documents, instead of being retyped into
 * each `<lang>.md` file (CLAUDE.md rule 7: one source of truth per fact).
 *
 * Throws on an unresolved placeholder — a document must never render with
 * a literal `{{...}}` visible. Also throws when a supplied value is never
 * used: each caller builds a values object tailored to one document, so an
 * unused entry means the template and its variables have drifted apart,
 * which is worth surfacing at build time rather than shipping silently.
 *
 * Deliberately not a general templating engine: no conditionals, no loops,
 * no escaping. A translator or Mez should be able to read the raw `.md`
 * file and understand it without knowing this function exists.
 */
export function interpolate(template: string, values: Readonly<Record<string, string>>): string {
  const used = new Set<string>();

  const result = template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (!(key in values)) {
      throw new Error(`Unresolved placeholder {{${key}}} — no value provided`);
    }
    used.add(key);
    return values[key]!;
  });

  const unused = Object.keys(values).filter((key) => !used.has(key));
  if (unused.length > 0) {
    throw new Error(`Unused interpolation value(s): ${unused.join(", ")}`);
  }

  return result;
}
