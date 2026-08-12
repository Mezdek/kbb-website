import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Ltr } from "@/components/Ltr";
import { getSiteConfig } from "@/lib/config";

/**
 * Address, phone and email are read once from `config/site.json` — never
 * retyped here — the same pattern `Footer.tsx` already uses (CLAUDE.md
 * rule 7: one source of truth per fact).
 */
export default async function KontaktPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const tPage = await getTranslations({ locale, namespace: "kontaktPage" });
  const config = getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-250 bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header active="kontakt" locale={locale} />
        <div className="px-4 py-8 md:px-10 md:py-11">
          <h1 className="text-[26px] font-normal text-primary md:text-[34px]">{t("kontakt")}</h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-[1.7] text-text-secondary md:text-base">
            {tPage("intro")}
          </p>

          <dl className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
                {tPage("addressHeading")}
              </dt>
              <dd className="mt-1 text-sm leading-[1.7] text-primary">
                <Ltr className="block">{config.org.legalName}</Ltr>
                <Ltr className="block">{config.org.address.street}</Ltr>
                <Ltr className="block">
                  {config.org.address.postalCode} {config.org.address.city}
                </Ltr>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
                {tPage("phoneHeading")}
              </dt>
              <dd className="mt-1 text-sm text-primary">
                <Ltr className="block">{config.org.phone ?? "PLATZHALTER"}</Ltr>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
                {tPage("emailHeading")}
              </dt>
              <dd className="mt-1 text-sm text-primary">
                <Ltr className="block">
                  <a href={`mailto:${config.org.contactEmail}`} className="text-inherit">
                    {config.org.contactEmail}
                  </a>
                </Ltr>
              </dd>
            </div>
          </dl>

          <p className="mt-8 max-w-[60ch] text-sm leading-[1.7] text-text-secondary">
            {tPage("visitNote")}
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
}
