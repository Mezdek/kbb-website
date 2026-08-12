import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { HausordnungDocument } from "@/lib/content/hausordnung";

/**
 * The document-language chooser for `/moschee/hausordnung` — a labelled
 * row of endonym links, deliberately distinct from the navbar
 * `LanguageSwitcher` (an unlabelled dropdown that switches the whole
 * site's UI locale, not just this one document). One component for both
 * placements the page needs (CLAUDE.md: /moschee/hausordnung):
 * `standalone` is the centered chooser shown with no document selected;
 * `top` sits above the rendered document so the reader can switch language
 * without leaving the page.
 *
 * Names come from `common.localeNames`, the same source the navbar
 * switcher uses, falling back to the bare file-name code — so a dropped-in
 * `ckb.md` appears as "ckb" rather than not at all.
 */
export async function DocumentLanguagePicker({
  languages,
  current,
  label,
  instruction,
  basePath,
  placement,
}: {
  languages: readonly HausordnungDocument[];
  current: string | undefined;
  label: string;
  instruction: string;
  basePath: string;
  placement: "standalone" | "top";
}) {
  const tLanguageNames = await getTranslations("common.localeNames");
  const isStandalone = placement === "standalone";

  return (
    <div
      className={
        isStandalone
          ? "flex flex-col items-center gap-4 px-4 py-20 text-center md:px-10 md:py-28 print:hidden"
          : "flex flex-wrap items-center gap-3 border-b border-b-secondary/45 px-4 py-4 md:px-10 print:hidden"
      }
    >
      <div className={isStandalone ? "flex flex-col items-center gap-2" : "me-1"}>
        <span className="text-xs uppercase tracking-[0.18em] text-text-secondary">{label}</span>
        {isStandalone && (
          <p className="max-w-[46ch] text-sm leading-[1.65] text-text-secondary md:text-base">
            {instruction}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {languages.map((language) => (
          <Link
            key={language.code}
            href={{ pathname: basePath, query: { sprache: language.code } }}
            hrefLang={language.code}
            lang={language.code}
            dir={language.dir}
            aria-current={language.code === current ? "page" : undefined}
            className={`px-3 py-2 text-sm no-underline ${
              language.code === current
                ? "bg-primary text-secondary-shade-2"
                : "border border-secondary/60 text-primary"
            } ${language.dir === "rtl" ? "font-arabic" : "font-latin"}`}
          >
            {tLanguageNames.has(language.code) ? tLanguageNames(language.code) : language.code}
          </Link>
        ))}
      </div>
    </div>
  );
}
