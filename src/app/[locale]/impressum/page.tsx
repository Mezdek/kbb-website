import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { LegalDocumentArticle } from "@/components/LegalDocumentArticle";
import { getSiteConfig } from "@/lib/config";

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "impressum" });
  const tBoard = await getTranslations({ locale, namespace: "board" });
  const config = getSiteConfig();
  const { address } = config.org;
  const countryName =
    new Intl.DisplayNames([locale], { type: "region" }).of(address.country) ?? address.country;

  const representatives = config.board.filter((member) => member.representative);
  const chair = config.board.find((member) => member.role === "vorsitzender1");
  const responsibleName = chair?.name ?? tBoard("roles.vorsitzender1");

  const translationNotice = t("translationNotice");

  return (
    <PageShell>
      <Header locale={locale} />
      <LegalDocumentArticle locale={locale}>
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
        {translationNotice && <p className="italic">{translationNotice}</p>}

        <h2>{t("serviceProvider.heading")}</h2>
        <p>
          {config.org.legalName}
          <br />
          {address.street}
          <br />
          {address.postalCode} {address.city}
          <br />
          {countryName}
        </p>

        <h2>{t("board.heading")}</h2>
        <ul>
          {representatives.map((member) => (
            <li key={member.role}>
              {member.name
                ? `${member.name} — ${tBoard(`roles.${member.role}`)}`
                : tBoard(`roles.${member.role}`)}
            </li>
          ))}
        </ul>
        <p>{t("board.note")}</p>

        <h2>{t("contact.heading")}</h2>
        <p>
          {t("contact.phoneLabel")}: {config.org.phone}
          <br />
          {t("contact.emailLabel")}:{" "}
          <a href={`mailto:${config.org.contactEmail}`}>{config.org.contactEmail}</a>
        </p>

        <h2>{t("registry.heading")}</h2>
        <p>
          {t("registry.intro")}
          <br />
          {t("registry.courtLabel")}: {config.org.registry.court}
          <br />
          {t("registry.numberLabel")}: {config.org.registry.number}
        </p>

        <h2>{t("responsible.heading")}</h2>
        <p>
          {responsibleName}
          <br />
          {address.street}
          <br />
          {address.postalCode} {address.city}
        </p>

        <h2>{t("dispute.heading")}</h2>
        <p>{t("dispute.text")}</p>
      </LegalDocumentArticle>
      <Footer />
    </PageShell>
  );
}
