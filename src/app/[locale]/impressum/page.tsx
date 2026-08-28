import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { getContentDocument } from "@/lib/content/document";
import { getImpressumVariables } from "@/lib/content/orgVariables";
import { interpolate } from "@/lib/content/interpolate";
import { renderMarkdown } from "@/lib/content/markdown";

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const document = getContentDocument("impressum", locale);
  const variables = await getImpressumVariables(document.lang);
  const legal = { ...document, markdown: interpolate(document.markdown, variables) };

  return (
    <PageShell>
      <Header locale={locale} />
      <article
        lang={legal.lang}
        dir={legal.dir}
        className={`prose-document px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 ${
          legal.dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
        }`}
      >
        {renderMarkdown(legal.markdown)}
      </article>
      <Footer />
    </PageShell>
  );
}
