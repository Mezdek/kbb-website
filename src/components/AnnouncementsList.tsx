"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import { CategoryFilter } from "./CategoryFilter";
import { AnnouncementItem } from "./AnnouncementItem";
import { ButtonLink } from "./Button";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import {
  filterByCategory,
  getOccurringCategories,
  isAnnouncementPinned,
  resolveLocalizedText,
  sortAnnouncements,
} from "@/lib/content/announcements";
import { resolveCategoryLabel } from "@/lib/content/categoryLabel";
import { formatNumeral } from "@/lib/date";

const PAGE_SIZE = 4;

/**
 * The full `/aktuelles` list: fetches announcements via `useAnnouncements`,
 * then applies the category filter and pagination the page's URL search
 * params ask for. `category`/`page` are passed down from the (server)
 * page component, which reads them from `searchParams` — clicking
 * "older"/"newer" or a filter pill still navigates via `ButtonLink`/`Link`,
 * it just changes props on this already-mounted component instead of
 * re-fetching.
 */
export function AnnouncementsList({ category, page }: { category?: string; page: number }) {
  const locale = useLocale();
  const t = useTranslations("announcements");
  const messages = useMessages();
  const categories = messages.categories as Record<string, unknown> | undefined;

  const { announcements, isLoading, error } = useAnnouncements();

  if (isLoading) {
    return (
      <p className="py-10 text-center text-sm leading-[1.65] text-text-secondary md:text-base">
        {t("loading")}
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-center text-sm leading-[1.65] text-text-secondary md:text-base">
        {t("loadError")}
      </p>
    );
  }

  const now = new Date();
  const all = sortAnnouncements(announcements, now);
  const occurring = getOccurringCategories(all).map((slug) => ({
    slug,
    ...resolveCategoryLabel(categories, slug),
  }));

  const filtered = filterByCategory(all, category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const items = pageItems.map((announcement) => {
    const categoryLabel = announcement.category
      ? resolveCategoryLabel(categories, announcement.category)
      : undefined;
    return {
      slug: announcement.slug,
      category: announcement.category,
      categoryLabel: categoryLabel?.label,
      categoryIsTranslated: categoryLabel?.isTranslated,
      pinned: isAnnouncementPinned(announcement, now),
      publishDate: announcement.publishDate,
      title: resolveLocalizedText(announcement.title, locale),
      excerpt: resolveLocalizedText(announcement.body, locale),
    };
  });

  function pageHref(targetPage: number) {
    const query: Record<string, string> = {};
    if (category) query.category = category;
    if (targetPage > 1) query.page = String(targetPage);
    return { pathname: "/aktuelles", query };
  }

  return (
    <>
      <div className="mt-6 border-b border-secondary/45 px-4 pb-5 md:px-10">
        <CategoryFilter
          options={occurring}
          active={category}
          allLabel={t("filterAll")}
          basePath="/aktuelles"
        />
      </div>

      <div className="px-4 py-2 md:px-10">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm leading-[1.65] text-text-secondary md:text-base">
            {t("empty")}
          </p>
        ) : (
          <>
            <div className="flex flex-col">
              {items.map((item) => (
                <AnnouncementItem
                  key={item.slug}
                  item={item}
                  pinnedLabel={t("pinnedBadge")}
                  locale={locale}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-text-secondary">
              <span>
                {t("paginationLabel", {
                  shown: formatNumeral(items.length, locale),
                  total: formatNumeral(filtered.length, locale),
                })}
              </span>
              <div className="flex gap-2">
                <ButtonLink
                  href={pageHref(Math.max(1, safePage - 1))}
                  variant={safePage <= 1 ? "inactive" : "utility"}
                  aria-disabled={safePage <= 1}
                >
                  {t("newer")}
                </ButtonLink>
                <ButtonLink
                  href={pageHref(Math.min(totalPages, safePage + 1))}
                  variant={safePage >= totalPages ? "inactive" : "utility"}
                  aria-disabled={safePage >= totalPages}
                >
                  {t("older")}
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
