export interface CategoryLabel {
  label: string;
  isTranslated: boolean;
}

/**
 * Looks up a category's display label in the (already English-merged)
 * messages tree. If the category has no key anywhere — not even in
 * English — the raw slug is returned instead (CLAUDE.md: Content —
 * category is free text, rendered as its slug when untranslated).
 */
export function resolveCategoryLabel(
  categories: Record<string, unknown> | undefined,
  slug: string,
): CategoryLabel {
  const value = categories?.[slug];
  if (typeof value === "string") {
    return { label: value, isTranslated: true };
  }
  return { label: slug, isTranslated: false };
}
