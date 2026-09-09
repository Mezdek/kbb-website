import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { Ltr } from "@/components/Ltr";
import { CopyButton } from "@/components/CopyButton";
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
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const config = getSiteConfig();
  const addressLine = `${config.org.address.street}, ${config.org.address.postalCode} ${config.org.address.city}`;

  return (
    <PageShell>
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
              <div className="flex items-center gap-2">
                <Ltr className="block">{addressLine}</Ltr>
                <CopyButton
                  value={addressLine}
                  fieldLabel={tPage("addressHeading")}
                  copyLabel={tCommon("copy")}
                  copiedLabel={tCommon("copied")}
                />
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
              {tPage("phoneHeading")}
            </dt>
            <dd className="mt-1 text-sm text-primary">
              <div className="flex items-center gap-2">
                <Ltr className="block">{config.org.phone}</Ltr>
                <CopyButton
                  value={config.org.phone}
                  fieldLabel={tPage("phoneHeading")}
                  copyLabel={tCommon("copy")}
                  copiedLabel={tCommon("copied")}
                />
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
              {tPage("emailHeading")}
            </dt>
            <dd className="mt-1 text-sm text-primary">
              <div className="flex items-center gap-2">
                <Ltr className="block">
                  <a href={`mailto:${config.org.contactEmail}`} className="text-inherit">
                    {config.org.contactEmail}
                  </a>
                </Ltr>
                <CopyButton
                  value={config.org.contactEmail}
                  fieldLabel={tPage("emailHeading")}
                  copyLabel={tCommon("copy")}
                  copiedLabel={tCommon("copied")}
                />
              </div>
            </dd>
          </div>
        </dl>

        <p className="mt-8 max-w-[60ch] text-sm leading-[1.7] text-text-secondary">
          {tPage("visitNote")}
        </p>
      </div>
      <Footer />
    </PageShell>
  );
}
