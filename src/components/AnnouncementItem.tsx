import { Link } from "@/i18n/navigation";
import { withNativeNumerals } from "@/lib/date";
import { CategoryIcon } from "./CategoryIcon";
import type { ResolvedLocalizedText } from "@/lib/content/announcements";

export interface AnnouncementItemData {
  slug: string;
  category?: string;
  categoryLabel?: string;
  categoryIsTranslated?: boolean;
  pinned: boolean;
  publishDate: string;
  title: ResolvedLocalizedText;
  excerpt: ResolvedLocalizedText;
}

/**
 * Shared by the homepage teaser (`dense`) and the full `/aktuelles` list.
 * The whole card is a single link, a deliberate simplification over the
 * mockup's inconsistent per-context link scoping (README: "match the
 * visual output, don't copy internal structure").
 */
export function AnnouncementItem({
  item,
  pinnedLabel,
  locale,
  dense = false,
}: {
  item: AnnouncementItemData;
  pinnedLabel: string;
  locale: string;
  dense?: boolean;
}) {
  const dateLabel = new Intl.DateTimeFormat(withNativeNumerals(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${item.publishDate}T12:00:00Z`));

  const iconSize = dense ? "h-10 w-10" : "h-[52px] w-[52px]";
  const iconInnerSize = dense ? "h-4 w-4" : "h-5 w-5";

  return (
    <Link
      href={`/aktuelles/${item.slug}`}
      className={`flex gap-3.5 border-b border-secondary/30 text-inherit no-underline md:gap-5 ${
        dense ? "py-4" : "py-6"
      } ${item.pinned ? "bg-linear-to-r from-flair-shade-2/5 to-transparent rtl:bg-linear-to-l" : ""}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center border text-flair-shade-2 ${iconSize} ${
          item.pinned ? "border-secondary" : "border-secondary/45"
        }`}
      >
        <CategoryIcon category={item.category} className={iconInnerSize} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1.5 flex flex-wrap items-center gap-2.5">
          {item.pinned && (
            <span className="bg-flair-shade-2 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-secondary-shade-2">
              {pinnedLabel}
            </span>
          )}
          {item.categoryLabel && (
            <span
              className={
                item.categoryIsTranslated
                  ? "text-xs uppercase tracking-[0.12em] text-text-secondary"
                  : "border border-secondary/45 px-1.5 py-0.5 font-mono text-xs text-text-secondary"
              }
            >
              {item.categoryLabel}
            </span>
          )}
          {!dense && <span className="text-[13px] text-text-secondary">{dateLabel}</span>}
        </span>
        <span
          lang={item.title.lang}
          dir={item.title.dir}
          className={`block text-primary ${dense ? "text-[17px]" : "text-[21px]"}`}
        >
          {item.title.text}
        </span>
        {!dense && (
          <p
            lang={item.excerpt.lang}
            dir={item.excerpt.dir}
            className="mt-1.5 max-w-[70ch] text-base leading-[1.6] text-text-secondary"
          >
            {item.excerpt.text}
          </p>
        )}
        {dense && <span className="mt-1 block text-[13px] text-text-secondary">{dateLabel}</span>}
      </span>
    </Link>
  );
}
