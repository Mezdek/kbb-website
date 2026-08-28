import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AnnouncementItem } from "@/components/AnnouncementItem";
import { ButtonLink } from "@/components/Button";
import {
  filterByCategory,
  getAnnouncements,
  getOccurringCategories,
  isAnnouncementPinned,
  resolveLocalizedText,
} from "@/lib/content/announcements";
import { resolveCategoryLabel } from "@/lib/content/categoryLabel";
import { formatNumeral } from "@/lib/date";

const PAGE_SIZE = 4;

export default async function AktuellesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { category, page: pageParam } = await searchParams;

  const t = await getTranslations("announcements");
  const messages = await getMessages();
  const categories = messages.categories as Record<string, unknown> | undefined;

  const now = new Date();
  const all = getAnnouncements(now);
  const occurring = getOccurringCategories(all).map((slug) => ({
    slug,
    ...resolveCategoryLabel(categories, slug),
  }));

  const filtered = filterByCategory(all, category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <PageShell>
      <Header active="aktuelles" locale={locale} />

      <div className="px-4 pt-9 md:px-10">
        <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
          {t("eyebrow")}
        </div>
        <h1 className="mb-2.5 text-[26px] font-normal text-primary md:text-[34px]">{t("title")}</h1>
        <p className="max-w-[62ch] text-sm leading-[1.65] text-text-secondary md:text-base">
          {t("intro")}
        </p>
      </div>

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
                  href={pageHref(Math.max(1, page - 1))}
                  variant={page <= 1 ? "inactive" : "utility"}
                  aria-disabled={page <= 1}
                >
                  {t("newer")}
                </ButtonLink>
                <ButtonLink
                  href={pageHref(Math.min(totalPages, page + 1))}
                  variant={page >= totalPages ? "inactive" : "utility"}
                  aria-disabled={page >= totalPages}
                >
                  {t("older")}
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </PageShell>
  );
}
