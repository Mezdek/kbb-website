import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/config";

/**
 * Roles come from § 14 of the Satzung and are fixed; names are optional and
 * only present where written consent exists (CLAUDE.md: /verein/vorstand).
 * Data is `config.board` — the same source Impressum interpolates from, so
 * a name or role change is made once and appears in both places.
 */
export default async function VorstandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer.columns.verein" });
  const tBoard = await getTranslations({ locale, namespace: "board" });
  const tPage = await getTranslations({ locale, namespace: "vorstandPage" });
  const config = getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1000px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] md:border md:border-secondary/60">
        <Header active="verein" locale={locale} />
        <div className="px-4 py-8 md:px-10 md:py-11">
          <h1 className="text-[26px] font-normal text-primary md:text-[34px]">{t("vorstand")}</h1>
          <p className="mt-3 max-w-[65ch] text-sm leading-[1.7] text-text-secondary md:text-base">
            {tPage("intro")}
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {config.board.map((member) => (
              <li
                key={member.role}
                className="rounded-sm border border-secondary/40 bg-secondary-shade-2/40 px-5 py-4"
              >
                <div className="text-base font-medium text-primary">
                  {member.name ?? tBoard(`roles.${member.role}`)}
                </div>
                {member.name && (
                  <div className="text-sm text-text-secondary">{tBoard(`roles.${member.role}`)}</div>
                )}
                <div className="mt-1 text-xs uppercase tracking-[0.08em] text-secondary-shade-1">
                  {tBoard(member.representative ? "representative" : "notRepresentative")}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-[65ch] text-sm leading-[1.7] text-text-secondary">
            {tPage("termNote")}
          </p>
        </div>
        <Footer />
      </div>
    </div>
  );
}
