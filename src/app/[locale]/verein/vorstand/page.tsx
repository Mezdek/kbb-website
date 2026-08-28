import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";
import { getSiteConfig } from "@/lib/config";

/**
 * Roles come from § 14 of the Satzung and are fixed; names are optional and
 * only present where written consent exists (CLAUDE.md: /verein/vorstand).
 * Data is `config.board` — the same source Impressum interpolates from, so
 * a name or role change is made once and appears in both places.
 */
export default async function VorstandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer.columns.verein" });
  const tBoard = await getTranslations({ locale, namespace: "board" });
  const tPage = await getTranslations({ locale, namespace: "vorstandPage" });
  const config = getSiteConfig();
  const mainMembers = config.board.filter((member) => member.representative);
  const extendedMembers = config.board.filter((member) => !member.representative);

  return (
    <PageShell>
      <Header active="verein" locale={locale} />
      <div className="px-4 py-8 md:px-10 md:py-11">
        <h1 className="text-[26px] font-normal text-primary md:text-[34px]">{t("vorstand")}</h1>
        <p className="mt-3 max-w-[65ch] text-sm leading-[1.7] text-text-secondary md:text-base">
          {tPage("intro")}
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {mainMembers.map((member) => (
            <li
              key={member.role}
              className="rounded-sm border-4 border-double border-primary bg-secondary-shade-2/40 px-5 py-4"
            >
              <div className="text-base font-medium text-primary">
                {member.name ?? tBoard(`roles.${member.role}`)}
              </div>
              {member.name && (
                <div className="text-sm text-text-secondary">{tBoard(`roles.${member.role}`)}</div>
              )}
            </li>
          ))}
        </ul>

        {extendedMembers.length > 0 && (
          <ul className="mt-6 grid gap-4 border-t border-secondary/40 pt-6 md:grid-cols-2">
            {extendedMembers.map((member) => (
              <li
                key={member.role}
                className="rounded-sm border border-secondary/40 bg-secondary-shade-2/40 px-5 py-4"
              >
                <div className="text-base font-medium text-primary">
                  {member.name ?? tBoard(`roles.${member.role}`)}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 max-w-[65ch] text-sm leading-[1.7] text-text-secondary">
          {tPage("termNote")}
        </p>
      </div>
      <Footer />
    </PageShell>
  );
}
