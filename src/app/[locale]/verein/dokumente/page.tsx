import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Titles are the documents' real German names, not translation keys — the
// Satzung and Geschäftsordnung are only published in German, so their
// labels stay in German regardless of the active site locale (CLAUDE.md:
// /verein/dokumente — "don't run them through the i18n label system").
const DOCUMENTS = [
  { title: "Satzung", href: "/docs/satzung.pdf" },
  { title: "Geschäftsordnung", href: "/docs/go.pdf" },
] as const;

export default async function DokumentePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer.columns.verein");
  const tPage = await getTranslations("dokumentePage");

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1000px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header active="verein" locale={locale} />
        <div className="px-4 py-8 md:px-10 md:py-11">
          <h1 className="text-[26px] font-normal text-primary md:text-[34px]">{t("dokumente")}</h1>
          <p className="mt-3 max-w-[65ch] text-sm leading-[1.7] text-text-secondary md:text-base">
            {tPage("intro")}
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {DOCUMENTS.map((document) => (
              <li key={document.href}>
                <a
                  href={document.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="de"
                  dir="ltr"
                  className="flex items-center justify-between gap-4 border border-secondary/60 bg-secondary-shade-2/40 px-5 py-4 text-primary no-underline"
                >
                  <span className="text-base font-medium">{document.title}</span>
                  <span className="text-xs uppercase tracking-[0.1em] text-text-secondary">
                    {tPage("fileNote")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Footer />
      </div>
    </div>
  );
}
