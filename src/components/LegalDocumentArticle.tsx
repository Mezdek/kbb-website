import type { ReactNode } from "react";

/**
 * The shared `<article>` shell for Impressum, Datenschutz, Über uns and
 * Mitglied werden — identical wrapper, styling and `prose-document` tag
 * rules (`globals.css`) across all four, only the content inside differs.
 * Unlike the old Markdown-sourced documents, these render from the active
 * locale's own messages, so `lang`/`dir` simply follow the page locale —
 * the same way every other translated page does — rather than needing a
 * separately-resolved "content language" (CLAUDE.md: /impressum,
 * /datenschutz, /verein/ueber-uns, /verein/mitglied-werden).
 */
export function LegalDocumentArticle({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <article
      lang={locale}
      dir={dir}
      className={`prose-document px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 ${
        dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
      }`}
    >
      {children}
    </article>
  );
}
