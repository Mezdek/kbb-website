import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { LegalDocumentArticle } from "@/components/LegalDocumentArticle";
import { getSiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";

export default async function UeberUnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "ueberUns" });
  const config = getSiteConfig();
  const orgName = resolveLocalized(config.org.localizedName, locale).text;
  const mosqueName = resolveLocalized(config.org.mosqueName, locale).text;

  const purposeItems = [
    t("purposeItems.mosque", { mosqueName }),
    ...(t.raw("purposeItems.rest") as string[]),
  ];

  return (
    <PageShell>
      <Header active="verein" locale={locale} />
      <LegalDocumentArticle locale={locale}>
        <h1>{t("title")}</h1>
        <p>
          {t("intro", {
            orgName,
            city: config.org.address.city,
            registryNumber: config.org.registry.number,
            registryCourt: config.org.registry.court,
          })}
        </p>

        <h2>{t("purposeHeading")}</h2>
        <p>{t("purposeIntro")}</p>
        <ul>
          {purposeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{t("outreach")}</p>

        <p>
          {t.rich("contactPrompt", {
            contactLink: (chunks) => <a href={`mailto:${config.org.contactEmail}`}>{chunks}</a>,
          })}
        </p>
      </LegalDocumentArticle>
      <Footer />
    </PageShell>
  );
}
