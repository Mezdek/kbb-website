import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { LegalDocumentArticle } from "@/components/LegalDocumentArticle";

interface DatenschutzSubsection {
  heading: string;
  paragraphs: string[];
}

interface DatenschutzSection {
  heading: string;
  paragraphs: string[];
  subsections?: DatenschutzSubsection[];
}

interface RecipientsTable {
  heading: string;
  columns: string[];
  rows: string[][];
}

interface Rights {
  heading: string;
  intro: string;
  items: string[];
  outro: string;
}

interface Authority {
  heading: string;
  intro: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  phoneLabel: string;
  phone: string;
  faxLabel: string;
  fax: string;
  emailLabel: string;
  email: string;
}

/**
 * Content compiled from facts the association provided directly (see
 * CLAUDE.md: Content > Impressum, Datenschutz, Über uns, Mitglied werden).
 */
export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "datenschutz" });

  const sections = t.raw("sections") as DatenschutzSection[];
  const recipientsTable = t.raw("recipientsTable") as RecipientsTable;
  const rights = t.raw("rights") as Rights;
  const authority = t.raw("authority") as Authority;
  const translationNotice = t("translationNotice");

  return (
    <PageShell>
      <Header locale={locale} />
      <LegalDocumentArticle locale={locale}>
        <h1>{t("title")}</h1>
        {translationNotice && <p className="italic">{translationNotice}</p>}

        {sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
            {section.subsections?.map((subsection) => (
              <div key={subsection.heading}>
                <h3>{subsection.heading}</h3>
                {subsection.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}

        <h2>{recipientsTable.heading}</h2>
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr>
              {recipientsTable.columns.map((column) => (
                <th
                  key={column}
                  className="border-b-2 border-primary px-2 py-2 text-start font-medium"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recipientsTable.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="border-b border-secondary/40 px-2 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2>{rights.heading}</h2>
        <p>{rights.intro}</p>
        <ul>
          {rights.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{rights.outro}</p>

        <h2>{authority.heading}</h2>
        <p>{authority.intro}</p>
        <p>
          {authority.name}
          <br />
          {authority.addressLine1}
          <br />
          {authority.addressLine2}
          <br />
          {authority.phoneLabel}: {authority.phone}
          <br />
          {authority.faxLabel}: {authority.fax}
          <br />
          {authority.emailLabel}:{" "}
          <a href={`mailto:${authority.email}`}>{authority.email}</a>
        </p>
      </LegalDocumentArticle>
      <Footer />
    </PageShell>
  );
}
