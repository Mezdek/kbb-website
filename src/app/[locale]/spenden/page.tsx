import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/config";
import { DonationPurposePicker, type DonationPurpose } from "./DonationPurposePicker";

export default async function SpendenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("donations");
  const tNav = await getTranslations("nav");
  const config = getSiteConfig();
  const year = new Date().getFullYear();

  const purposes: DonationPurpose[] = config.donations.purposes.map((purpose) => ({
    id: purpose.id,
    name: t(`purposes.${purpose.id}.name`),
    description: t(`purposes.${purpose.id}.description`),
    verwendungszweck: purpose.verwendungszweckTemplate.replace("{year}", String(year)),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1000px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header active="spenden" locale={locale} />

        <div className="px-4 pt-9 md:px-10">
          <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
            {tNav("spenden")}
          </div>
          <h1 className="mb-2.5 text-[26px] font-normal text-primary md:text-[34px]">{t("title")}</h1>
          <p className="max-w-[62ch] text-sm leading-[1.65] text-text-secondary md:text-base">
            {t("intro")}
          </p>
        </div>

        <div className="px-4 py-8 md:px-10 md:py-9">
          <DonationPurposePicker
            purposes={purposes}
            bank={config.bank}
            recipientName={config.org.legalName}
            labels={{
              step1Heading: t("step1Heading"),
              step2Heading: t("step2Heading"),
              recipient: t("recipient"),
              iban: t("iban"),
              bic: t("bic"),
              bank: t("bank"),
              verwendungszweckLabel: t("verwendungszweckLabel"),
              giroCodeInstruction: t("giroCodeInstruction"),
              selectedLabel: t("selectedLabel"),
            }}
          />
        </div>

        <div className="px-4 pb-9 md:px-10">
          <p className="max-w-[74ch] text-sm leading-[1.7] text-text-secondary">
            {t("legalNotice", {
              taxOffice: config.donations.taxNotice.taxOffice,
              taxNumber: config.donations.taxNotice.taxNumber,
              email: config.org.donationsEmail,
            })}
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}
