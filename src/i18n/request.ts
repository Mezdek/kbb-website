import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { deepMerge, type MessageTree } from "./deepMerge";
import { routing, type Locale } from "./routing";

import fallbackMessages from "../../messages/en.json";

const messagesByLocale: Record<Locale, () => Promise<{ default: MessageTree }>> = {
  de: () => import("../../messages/de.json"),
  ar: () => import("../../messages/ar.json"),
  en: () => import("../../messages/en.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const active = (await messagesByLocale[locale]()).default;

  return {
    locale,
    // Every locale is merged over the fallback, so any missing key resolves
    // there automatically (CLAUDE.md: i18n).
    messages: deepMerge(fallbackMessages, active),
  };
});
