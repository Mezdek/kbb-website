import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/Button";
import { getSiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";

const LINKS = [
  { key: "gebetszeiten", href: "/moschee/gebetszeiten" },
  { key: "hausordnung", href: "/moschee/hausordnung" },
  { key: "freitagsgebet", href: "/moschee/freitagsgebet" },
] as const;

export default async function MoscheePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("moschee");
  const config = getSiteConfig();
  const mosqueName = resolveLocalized(config.org.mosqueName, locale);

  return (
    <PageShell>
      <Header active="moschee" locale={locale} />

      <div className="px-4 pt-9 md:px-10">
        <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
          {t("eyebrow")}
        </div>
        <h1
          lang={mosqueName.lang}
          dir={mosqueName.dir}
          className="mb-2.5 text-[26px] font-normal text-primary md:text-[34px]"
        >
          {mosqueName.text}
        </h1>
        <p className="max-w-[62ch] text-sm leading-[1.65] text-text-secondary md:text-base">
          {t("intro")}
        </p>
      </div>

      <div className="grid gap-3 px-4 py-8 md:grid-cols-3 md:px-10 md:py-11">
        {LINKS.map((link) => (
          <ButtonLink
            key={link.key}
            href={link.href}
            variant="secondary"
            className="justify-start px-5 py-4 text-start text-base"
          >
            {t(`links.${link.key}`)}
          </ButtonLink>
        ))}
      </div>

      <Footer />
    </PageShell>
  );
}
