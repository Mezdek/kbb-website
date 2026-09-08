"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import { AnnouncementItem } from "./AnnouncementItem";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import {
  isAnnouncementPinned,
  resolveLocalizedText,
  sortAnnouncements,
} from "@/lib/content/announcements";
import { resolveCategoryLabel } from "@/lib/content/categoryLabel";

/**
 * The homepage's "Aktuelles" teaser: the first `limit` announcements
 * (pinned-and-current first, then newest), fetched via the same
 * `useAnnouncements` hook the full `/aktuelles` list uses.
 */
export function AnnouncementsTeaser({ limit = 2 }: { limit?: number }) {
  const locale = useLocale();
  const t = useTranslations("announcements");
  const messages = useMessages();
  const categories = messages.categories as Record<string, unknown> | undefined;

  const { announcements, isLoading, error } = useAnnouncements();

  if (isLoading) {
    return <p className="text-sm leading-[1.65] text-text-secondary">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm leading-[1.65] text-text-secondary">{t("loadError")}</p>;
  }

  const now = new Date();
  const items = sortAnnouncements(announcements, now)
    .slice(0, limit)
    .map((announcement) => {
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

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <AnnouncementItem key={item.slug} item={item} pinnedLabel={t("pinnedBadge")} locale={locale} />
      ))}
    </div>
  );
}
