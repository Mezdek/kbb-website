import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { AnnouncementsList } from "@/components/AnnouncementsList";

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
  const page = Math.max(1, Number(pageParam) || 1);

  const t = await getTranslations("announcements");

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

      <AnnouncementsList category={category} page={page} />

      <Footer />
    </PageShell>
  );
}
