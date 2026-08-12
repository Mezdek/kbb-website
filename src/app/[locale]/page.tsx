import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PrayerBand } from "@/components/PrayerBand";
import { ButtonLink } from "@/components/Button";
import { Ltr } from "@/components/Ltr";
import { AnnouncementItem } from "@/components/AnnouncementItem";
import { getSiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";
import {
  getAnnouncements,
  isAnnouncementPinned,
  resolveLocalizedText,
} from "@/lib/content/announcements";
import { resolveCategoryLabel } from "@/lib/content/categoryLabel";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tAnnouncements = await getTranslations("announcements");
  const messages = await getMessages();
  const categories = messages.categories as Record<string, unknown> | undefined;

  const config = getSiteConfig();
  const orgName = resolveLocalized(config.org.localizedName, locale).text;
  const mosqueName = resolveLocalized(config.org.mosqueName, locale).text;
  const now = new Date();
  const teaserItems = getAnnouncements(now)
    .slice(0, 2)
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
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-7xl bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header locale={locale} />
        <PrayerBand locale={locale} />

        <div className="grid md:grid-cols-[1fr_360px] rtl:md:grid-cols-[360px_1fr]">
          <div className="px-4 py-9 md:order-1 md:px-12 md:py-13.5 md:rtl:order-2 md:border-e md:border-secondary/45">
            <h1 className="mb-3 max-w-[20ch] text-[23px] font-normal leading-[1.35] text-primary md:mb-4.5 md:text-[31px] md:leading-[1.28]">
              {t("heroTitle")}
            </h1>
            <p className="mb-3.5 max-w-[58ch] text-base leading-[1.65] text-text-secondary md:mb-3.5 md:text-[17px] md:leading-[1.7]">
              {t("paragraph1", { orgName, mosqueName })}
            </p>
            <p className="mb-4.5 max-w-[58ch] text-base leading-[1.65] text-text-secondary md:mb-7 md:text-[17px] md:leading-[1.7]">
              {t("paragraph2")}
            </p>
            <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
              <ButtonLink href="/verein/ueber-uns" variant="primary">
                {t("ctaAbout")}
              </ButtonLink>
              <ButtonLink href="/kontakt" variant="secondary">
                {t("ctaVisit")}
              </ButtonLink>
            </div>

            <div className="mt-6 border-t border-secondary/45 pt-5 md:mt-13 md:pt-6.5">
              <div className="mb-3 flex items-baseline justify-between md:mb-5">
                <div className="text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[13px]">
                  {t("aktuelles.heading")}
                </div>
                <ButtonLink href="/aktuelles" variant="utility" className="border-0 p-0 text-sm">
                  {t("aktuelles.all")}
                </ButtonLink>
              </div>
              <div className="flex flex-col">
                {teaserItems.map((item) => (
                  <AnnouncementItem
                    key={item.slug}
                    item={item}
                    pinnedLabel={tAnnouncements("pinnedBadge")}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6 bg-secondary/13 px-4 py-9 md:order-2 md:gap-8.5 md:px-10 md:py-13.5 md:rtl:order-1">
            <div>
              <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:mb-3 md:text-[13px]">
                {t("aside.fridayHeading")}
              </div>
              <Ltr className="block text-[28px] leading-none text-primary md:text-[34px]">
                {config.fridayPrayer.khutbahTime}
              </Ltr>
              <p className="mt-2.5 text-sm leading-[1.6] text-text-secondary">
                {t("aside.fridayNote")}
              </p>
            </div>
            <div className="border-t border-secondary/45 pt-5 md:pt-6.5">
              <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:mb-3 md:text-[13px]">
                {t("aside.addressHeading")}
              </div>
              <Ltr className="block text-base leading-[1.65] text-text-body">
                {config.org.address.street}
                <br />
                {config.org.address.postalCode} {config.org.address.city}
              </Ltr>
              <ButtonLink
                href="/kontakt"
                variant="utility"
                className="mt-2.5 inline-flex border-0 p-0 text-sm"
              >
                {t("aside.directionsLink")}
              </ButtonLink>
            </div>
            <div className="border-t border-secondary/45 pt-5 md:pt-6.5">
              <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:mb-3 md:text-[13px]">
                {t("aside.donateHeading")}
              </div>
              <p className="mb-3.5 text-sm leading-[1.6] text-text-secondary">
                {t("aside.donateBlurb")}
              </p>
              <ButtonLink href="/spenden" variant="donate">
                {t("aside.donateCta")}
              </ButtonLink>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </div>
  );
}
