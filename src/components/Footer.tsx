import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteConfig } from "@/lib/config";
import { Ltr } from "./Ltr";

function FooterColumn({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-secondary-shade-1">{heading}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

const linkClass = "block text-inherit no-underline";

export async function Footer() {
  const t = await getTranslations("footer");
  const config = getSiteConfig();

  return (
    <footer className="grid gap-8 bg-primary px-4 py-8 text-sm leading-[1.8] text-secondary-shade-2/80 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-12 md:py-10">
      <div>
        <Ltr className="mb-2 block text-base text-secondary-shade-2">{config.org.legalName}</Ltr>
        <Ltr className="block">
          {config.org.address.street}, {config.org.address.postalCode} {config.org.address.city}
        </Ltr>
        <Ltr className="block">
          {t("registryLine", {
            number: config.org.registry.number,
            court: config.org.registry.court,
          })}
        </Ltr>
      </div>

      <FooterColumn heading={t("columns.moschee.heading")}>
        <Link href="/moschee/gebetszeiten" className={linkClass}>
          {t("columns.moschee.gebetszeiten")}
        </Link>
        <Link href="/moschee/freitagsgebet" className={linkClass}>
          {t("columns.moschee.freitagsgebet")}
        </Link>
        <Link href="/moschee/hausordnung" className={linkClass}>
          {t("columns.moschee.hausordnung")}
        </Link>
      </FooterColumn>

      <FooterColumn heading={t("columns.verein.heading")}>
        <Link href="/verein/ueber-uns" className={linkClass}>
          {t("columns.verein.ueberUns")}
        </Link>
        <Link href="/verein/vorstand" className={linkClass}>
          {t("columns.verein.vorstand")}
        </Link>
        <Link href="/verein/mitglied-werden" className={linkClass}>
          {t("columns.verein.mitgliedWerden")}
        </Link>
        <Link href="/verein/dokumente" className={linkClass}>
          {t("columns.verein.dokumente")}
        </Link>
      </FooterColumn>

      <FooterColumn heading={t("columns.legal.heading")}>
        <Link href="/impressum" className={linkClass}>
          {t("columns.legal.impressum")}
        </Link>
        <Link href="/datenschutz" className={linkClass}>
          {t("columns.legal.datenschutz")}
        </Link>
      </FooterColumn>
    </footer>
  );
}
