import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { getContentDocument } from "@/lib/content/document";
import { getUeberUnsVariables } from "@/lib/content/orgVariables";
import { interpolate } from "@/lib/content/interpolate";
import { renderMarkdown } from "@/lib/content/markdown";

export default async function UeberUnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const document = getContentDocument("ueber-uns", locale);
  const variables = await getUeberUnsVariables(document.lang);
  const markdown = interpolate(document.markdown, variables);

  return (
    <PageShell>
      <Header active="verein" locale={locale} />
      <article
        lang={document.lang}
        dir={document.dir}
        className={`prose-document px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 ${
          document.dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
        }`}
      >
        {renderMarkdown(markdown)}
      </article>
      <Footer />
    </PageShell>
  );
}
