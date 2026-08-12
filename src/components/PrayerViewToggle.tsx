import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Desktop-only Gregorian/Hijri mode switch (CLAUDE.md: /moschee/gebetszeiten
 * — "two listing modes, switchable by the visitor"). Switching mode always
 * lands on "today" in the newly selected calendar — the page supplies that
 * default whenever `month`/`date` is absent from the URL — rather than
 * trying to carry over a specific month across calendars, which this site
 * cannot do without Hijri conversion (CLAUDE.md: Prayer times).
 */
export async function PrayerViewToggle({ view }: { view: "gregorian" | "hijri" }) {
  const t = await getTranslations("prayerTimes.view");

  function tabClass(active: boolean) {
    return `px-3 py-2 text-sm no-underline ${active ? "bg-primary text-secondary-shade-2" : "text-primary"}`;
  }

  return (
    <div className="inline-flex border border-secondary print:hidden">
      <Link
        href={{ pathname: "/moschee/gebetszeiten", query: { view: "gregorian" } }}
        className={tabClass(view === "gregorian")}
        aria-current={view === "gregorian" ? "page" : undefined}
      >
        {t("gregorian")}
      </Link>
      <Link
        href={{ pathname: "/moschee/gebetszeiten", query: { view: "hijri" } }}
        className={`border-s border-secondary ${tabClass(view === "hijri")}`}
        aria-current={view === "hijri" ? "page" : undefined}
      >
        {t("hijri")}
      </Link>
    </div>
  );
}
