import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { LegalDocumentArticle } from "@/components/LegalDocumentArticle";
import { getSiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";

export default async function MitgliedWerdenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "mitgliedWerden" });
  const config = getSiteConfig();
  const orgName = resolveLocalized(config.org.localizedName, locale).text;

  const steps = t.raw("process.steps") as string[];
  const feeItems = t.raw("fees.items") as string[];

  return (
    <PageShell>
      <Header active="verein" locale={locale} />
      <LegalDocumentArticle locale={locale}>
        <h1>{t("title")}</h1>
        <p>{t("intro", { orgName })}</p>

        <h2>{t("process.heading")}</h2>
        <ol>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          {t.rich("process.applyPrompt", {
            email: () => (
              <a href={`mailto:${config.org.contactEmail}`}>{config.org.contactEmail}</a>
            ),
          })}
        </p>

        <h2>{t("fees.heading")}</h2>
        <p>{t("fees.intro")}</p>
        <ul>
          {feeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{t("fees.note")}</p>

        <h2>{t("volunteer.heading")}</h2>
        <p>{t("volunteer.text")}</p>
        <p>{t("volunteer.exemptions")}</p>
      </LegalDocumentArticle>
      <Footer />
    </PageShell>
  );
}
