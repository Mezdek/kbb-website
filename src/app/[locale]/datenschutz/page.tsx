import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { LegalDocumentArticle } from "@/components/LegalDocumentArticle";
import { getSiteConfig } from "@/lib/config";

interface DatenschutzSection {
  heading: string;
  placeholder: string;
}

export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "datenschutz" });
  const config = getSiteConfig();
  const { address } = config.org;

  const sections = t.raw("sections") as DatenschutzSection[];
  const translationNotice = t("translationNotice");

  return (
    <PageShell>
      <Header locale={locale} />
      <LegalDocumentArticle locale={locale}>
        <h1>{t("title")}</h1>
        <blockquote className="my-6 border-s-4 border-flair-shade-2 bg-flair/5 py-2 ps-4">
          <strong>{t("draftNoticeBold")}</strong> {t("draftNoticeRest")}
        </blockquote>
        {translationNotice && <p className="italic">{translationNotice}</p>}

        <h2>{t("controller.heading")}</h2>
        <p>
          {config.org.legalName}
          <br />
          {address.street}, {address.postalCode} {address.city}
          <br />
          {t("controller.emailLabel")}:{" "}
          <a href={`mailto:${config.org.contactEmail}`}>{config.org.contactEmail}</a>
        </p>

        {sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            <p className="italic">{section.placeholder}</p>
          </div>
        ))}

        <h2>{t("rights.heading")}</h2>
        <p>{t("rights.text")}</p>
        <p className="italic">{t("rights.placeholder")}</p>

        <h2>{t("contact.heading")}</h2>
        <p>
          <a href={`mailto:${config.org.contactEmail}`}>{config.org.contactEmail}</a>
        </p>
      </LegalDocumentArticle>
      <Footer />
    </PageShell>
  );
}
