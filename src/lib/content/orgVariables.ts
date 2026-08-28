import { getTranslations } from "next-intl/server";
import { getSiteConfig, type SiteConfig } from "@/lib/config";
import { resolveLocalized } from "@/lib/localized";

/**
 * Board members whose role carries § 26 BGB representation, in Satzung
 * order, formatted "Name — Role" one per line (Markdown line breaks, two
 * trailing spaces). A representative with no `name` yet (no written
 * consent to publish) is rendered by role only — the Impressum's legal
 * requirement is that the representing board be identifiable, not that
 * every seat be named.
 */
function formatRepresentatives(
  board: SiteConfig["board"],
  roleLabel: (role: string) => string,
): string {
  return board
    .filter((member) => member.representative)
    .map((member) =>
      member.name ? `${member.name} — ${roleLabel(member.role)}` : roleLabel(member.role),
    )
    .join("  \n");
}

/**
 * The 1. Vorsitzende/r, who is responsible for content pursuant to § 18
 * Absatz 2 MStV. Falls back to the role label alone if no name is on file,
 * rather than throwing — an Impressum without this section is a bigger
 * defect than one that names a role instead of a person.
 */
function responsibleName(board: SiteConfig["board"], roleLabel: (role: string) => string): string {
  const chair = board.find((member) => member.role === "vorsitzender1");
  return chair?.name ?? roleLabel("vorsitzender1");
}

/**
 * `{{placeholder}}` values for `content/impressum/<lang>.md`, built once
 * per request from `config/site.json` (CLAUDE.md: single source of truth)
 * plus the localized role labels in `messages/<lang>.json` under `board`.
 */
export async function getImpressumVariables(locale: string): Promise<Record<string, string>> {
  const config = getSiteConfig();
  const t = await getTranslations({ locale, namespace: "board" });
  const roleLabel = (role: string) => t(`roles.${role}`);
  const countryName = new Intl.DisplayNames([locale], { type: "region" }).of(
    config.org.address.country,
  );

  return {
    legalName: config.org.legalName,
    street: config.org.address.street,
    postalCode: config.org.address.postalCode,
    city: config.org.address.city,
    country: countryName ?? config.org.address.country,
    boardRepresentatives: formatRepresentatives(config.board, roleLabel),
    phone: config.org.phone,
    contactEmail: config.org.contactEmail,
    registryCourt: config.org.registry.court,
    registryNumber: config.org.registry.number,
    responsibleName: responsibleName(config.board, roleLabel),
  };
}

/**
 * `{{placeholder}}` values for `content/datenschutz/<lang>.md` — the
 * Verantwortlicher block only (legal name, address, contact email). Kept
 * separate from `getImpressumVariables` because `interpolate` rejects
 * unused values, and the Datenschutz draft has no board or registry
 * section.
 */
export function getDatenschutzVariables(): Record<string, string> {
  const config = getSiteConfig();
  return {
    legalName: config.org.legalName,
    street: config.org.address.street,
    postalCode: config.org.address.postalCode,
    city: config.org.address.city,
    contactEmail: config.org.contactEmail,
  };
}

/**
 * The full pool of general-copy values available to content pages, keyed
 * by the association's own name and city rather than the legal name — per
 * the `org.localizedName` rule (CLAUDE.md: Configuration — `legalName` is
 * for legally-required contexts only, `localizedName` is for everywhere
 * else). `interpolate` rejects unused values, so each page below picks
 * only the subset its own template actually references, rather than every
 * caller passing this whole pool.
 */
async function contentVariablePool(locale: string): Promise<Record<string, string>> {
  const config = getSiteConfig();
  return {
    orgName: resolveLocalized(config.org.localizedName, locale).text,
    mosqueName: resolveLocalized(config.org.mosqueName, locale).text,
    city: config.org.address.city,
    registryCourt: config.org.registry.court,
    registryNumber: config.org.registry.number,
    contactEmail: config.org.contactEmail,
  };
}

function pick<T extends string>(
  pool: Record<string, string>,
  keys: readonly T[],
): Record<T, string> {
  return Object.fromEntries(keys.map((key) => [key, pool[key]!])) as Record<T, string>;
}

/** `{{placeholder}}` values for `content/ueber-uns/<lang>.md`. */
export async function getUeberUnsVariables(locale: string): Promise<Record<string, string>> {
  const pool = await contentVariablePool(locale);
  return pick(pool, [
    "orgName",
    "city",
    "registryNumber",
    "registryCourt",
    "mosqueName",
    "contactEmail",
  ]);
}

/** `{{placeholder}}` values for `content/mitglied-werden/<lang>.md`. */
export async function getMitgliedWerdenVariables(locale: string): Promise<Record<string, string>> {
  const pool = await contentVariablePool(locale);
  return pick(pool, ["orgName", "contactEmail"]);
}
