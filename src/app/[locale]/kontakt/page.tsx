import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UnderConstruction } from "@/components/UnderConstruction";

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1000px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header active="kontakt" locale={locale} />
        <UnderConstruction title={t("kontakt")} />
        <Footer />
      </div>
    </div>
  );
}
