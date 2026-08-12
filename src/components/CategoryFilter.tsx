import { Link } from "@/i18n/navigation";

export interface CategoryFilterOption {
  slug: string;
  label: string;
  isTranslated: boolean;
}

const PILL_BASE = "shrink-0 px-4 py-2 text-sm no-underline";
const PILL_ACTIVE = "bg-primary text-secondary-shade-2";
const PILL_INACTIVE = "border border-secondary/60 text-text-secondary";

/**
 * Filtering is a plain server re-render via a `?category=` search param —
 * no client JS needed, since "is this pill active" is just "does its
 * category match the current query", computable at render time.
 */
export function CategoryFilter({
  options,
  active,
  allLabel,
  basePath,
}: {
  options: CategoryFilterOption[];
  active: string | undefined;
  allLabel: string;
  basePath: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <Link
        href={basePath}
        className={`${PILL_BASE} ${!active ? PILL_ACTIVE : PILL_INACTIVE}`}
      >
        {allLabel}
      </Link>
      {options.map((option) => (
        <Link
          key={option.slug}
          href={{ pathname: basePath, query: { category: option.slug } }}
          className={`${PILL_BASE} ${active === option.slug ? PILL_ACTIVE : PILL_INACTIVE} ${
            option.isTranslated ? "" : "font-mono"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
