import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StarMark } from "./icons/StarMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { getSiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";

type NavKey = "moschee" | "aktuelles" | "spenden" | "verein" | "kontakt";

const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: "moschee", href: "/moschee" },
  { key: "aktuelles", href: "/aktuelles" },
  { key: "spenden", href: "/spenden" },
  { key: "verein", href: "/verein/ueber-uns" },
  { key: "kontakt", href: "/kontakt" },
];

export async function Header({ active, locale }: { active?: NavKey; locale: string }) {
  const t = await getTranslations("nav");
  const config = getSiteConfig();
  const orgName = resolveLocalized(config.org.localizedName, locale);
  const mobileMenuLabel = locale === "ar" ? "القائمة" : "MENÜ";

  return (
    <header className="bg-primary text-secondary-shade-2">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 md:px-12 md:py-[22px]">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-secondary-shade-2 no-underline md:gap-3.5"
        >
          <StarMark className="h-6 w-6 shrink-0 text-secondary md:h-[30px] md:w-[30px]" />
          <span lang={orgName.lang} dir={orgName.dir} className="text-sm font-medium md:text-[17px]">
            {orgName.text}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`pb-[3px] text-secondary-shade-2 no-underline ${
                item.key === active ? "border-b-2 border-secondary" : ""
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="md:hidden">
            <MobileNav label={mobileMenuLabel}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="border-b border-secondary-shade-2/10 px-4 py-3 text-sm text-secondary-shade-2 no-underline last:border-0"
                >
                  {t(item.key)}
                </Link>
              ))}
            </MobileNav>
          </div>
        </div>
      </div>
    </header>
  );
}
