import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { UnderConstruction } from "@/components/UnderConstruction";

export default async function FreitagsgebetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("moschee.links");

  return (
    <PageShell>
      <Header active="moschee" locale={locale} />
      <UnderConstruction title={t("freitagsgebet")} />
      <Footer />
    </PageShell>
  );
}
