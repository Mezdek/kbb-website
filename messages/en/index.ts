import common from "./common.json";
import nav from "./nav.json";
import footer from "./footer.json";
import moschee from "./moschee.json";
import hausordnung from "./hausordnung.json";
import home from "./home.json";
import prayerBand from "./prayer-band.json";
import prayerTimes from "./prayer-times.json";
import announcements from "./announcements.json";
import categories from "./categories.json";
import donations from "./donations.json";
import hijri from "./hijri.json";
import board from "./board.json";
import vorstandPage from "./vorstand-page.json";
import dokumentePage from "./dokumente-page.json";
import kontaktPage from "./kontakt-page.json";
import impressum from "./impressum.json";
import datenschutz from "./datenschutz.json";
import ueberUns from "./ueber-uns.json";
import mitgliedWerden from "./mitglied-werden.json";

/**
 * One namespace, one file — reassembled here into the same shape
 * `src/i18n/request.ts` used to import directly from a single
 * `messages/<locale>.json`. Every `useTranslations`/`getTranslations` call
 * site is unaffected: the namespace keys below are unchanged, only which
 * file each one lives in.
 */
export default {
  common,
  nav,
  footer,
  moschee,
  hausordnung,
  home,
  prayerBand,
  prayerTimes,
  announcements,
  categories,
  donations,
  hijri,
  board,
  vorstandPage,
  dokumentePage,
  kontaktPage,
  impressum,
  datenschutz,
  ueberUns,
  mitgliedWerden,
};
