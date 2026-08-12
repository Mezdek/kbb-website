import { readCategoryIconMarkup } from "@/lib/content/categoryIcon";

/**
 * `content/icons/categories/*.svg` are repo-committed, author-controlled
 * files (CLAUDE.md: Content — one author, no CMS, no user input reaches
 * this path), so inlining their trusted markup directly is safe.
 */
export function CategoryIcon({ category, className }: { category?: string; className?: string }) {
  const markup = readCategoryIconMarkup(category);
  return <span className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}
