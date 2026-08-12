import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { DocumentLanguagePicker } from "@/components/DocumentLanguagePicker";
import { renderMarkdown } from "@/lib/content/markdown";
import {
  getAvailableHausordnungLanguages,
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
  setRequestLocale(locale);
  const { sprache } = await searchParams;

  const t = await getTranslations("hausordnung");
  const tMoschee = await getTranslations("moschee.links");

  const available = getAvailableHausordnungLanguages();
  const selectedCode = resolveHausordnungLanguage(sprache, available);
  const selected = available.find((language) => language.code === selectedCode);

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1000px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] print:shadow-none md:border md:border-secondary/60 print:border-0">
        <div className="print:hidden">
          <Header active="moschee" locale={locale} />
        </div>

        {selected ? (
          <>
            <DocumentLanguagePicker
              languages={available}
              current={selected.code}
              label={t("pickerLabel")}
              instruction={t("pickerInstruction")}
              basePath={ROUTE}
              placement="top"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-9 md:px-10 print:hidden">
              <h1 className="text-[26px] font-normal text-primary md:text-[34px]">
                {tMoschee("hausordnung")}
              </h1>
              <PrintButton variant="utility">⎙ {t("print")}</PrintButton>
            </div>

            <div
              lang={selected.code}
              dir={selected.dir}
              className={`max-w-[70ch] px-4 py-8 text-base leading-[1.7] text-text-body md:px-10 md:py-11 print:px-4 ${
                selected.dir === "rtl" ? "font-arabic text-[1.08em] leading-[1.85]" : "font-latin"
              }`}
            >
              {renderMarkdown(readHausordnungDocument(selected.code))}
            </div>
          </>
        ) : (
          <DocumentLanguagePicker
            languages={available}
            current={undefined}
            label={t("pickerLabel")}
            instruction={t("pickerInstruction")}
            basePath={ROUTE}
            placement="standalone"
          />
        )}

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
