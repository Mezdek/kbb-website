import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContentDocument } from "@/lib/content/document";
import { getDatenschutzVariables } from "@/lib/content/orgVariables";
import { interpolate } from "@/lib/content/interpolate";
import { renderMarkdown } from "@/lib/content/markdown";

/**
 * CLAUDE.md (Routes): "Do not draft legal copy" for this page. The Markdown
 * below is therefore a labelled draft outline, not reviewed legal text —
 * the non-binding notice is the document's first line, rendered as a
 * regular Markdown blockquote rather than suppressed or styled away.
 */
export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const document = getContentDocument("datenschutz", locale);
  const variables = getDatenschutzVariables();
  const markdown = interpolate(document.markdown, variables);

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-250 bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header locale={locale} />
        <article
          lang={document.lang}
          dir={document.dir}
          className={`prose-document px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 [&_blockquote]:border-s-4 [&_blockquote]:border-flair-shade-2 [&_blockquote]:bg-flair/5 [&_blockquote]:ps-4 [&_blockquote]:py-2 [&_blockquote]:my-6 ${
            document.dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
          }`}
        >
          {renderMarkdown(markdown)}
        </article>
        <Footer />
      </div>
    </div>
  );
}
