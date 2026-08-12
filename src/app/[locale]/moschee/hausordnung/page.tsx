import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { DocumentLanguagePicker } from "@/components/DocumentLanguagePicker";
import { renderMarkdown } from "@/lib/content/markdown";
import {
  HAUSORDNUNG_DOCUMENTS,
  readHausordnungDocument,
  resolveHausordnungLanguage,
} from "@/lib/content/hausordnung";

const ROUTE = "/moschee/hausordnung";

export default async function HausordnungPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sprache?: string }>;
}) {
  const { locale } = await params;
  // `setRequestLocale` is deprecated in favour of `next/root-params`, but
  // every page in this app still uses it. Migrating one page alone would
  // leave two styles side by side — that is a repo-wide change.
  setRequestLocale(locale);
  const { sprache } = await searchParams;

  const t = await getTranslations("hausordnung");
  const tMoschee = await getTranslations("moschee.links");

  const selectedCode = resolveHausordnungLanguage(sprache);
  const selected = HAUSORDNUNG_DOCUMENTS.find((language) => language.code === selectedCode);

  const picker = (placement: "standalone" | "top") => (
    <DocumentLanguagePicker
      languages={HAUSORDNUNG_DOCUMENTS}
      current={selected?.code}
      label={t("pickerLabel")}
      instruction={t("pickerInstruction")}
      basePath={ROUTE}
      placement={placement}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-250 bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] print:border-0 print:shadow-none md:border md:border-secondary/60">
        <div className="print:hidden">
          <Header active="moschee" locale={locale} />
        </div>

        {selected ? (
          <>
            {picker("top")}

            <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-9 md:px-10 print:hidden">
              <PrintButton variant="utility" className="text-[2rem]">
                ⎙
              </PrintButton>
            </div>

            <article
              lang={selected.code}
              dir={selected.dir}
              className={`prose-document px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 print:px-4 ${
                selected.dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
              }`}
            >
              {renderMarkdown(readHausordnungDocument(selected.code))}
            </article>
          </>
        ) : (
          <>
            <h1 className="px-4 pt-9 text-[26px] font-normal text-primary md:px-10 md:text-[34px]">
              {tMoschee("hausordnung")}
            </h1>
            {picker("standalone")}
          </>
        )}

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
