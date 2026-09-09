import type { ReactNode } from "react";

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
