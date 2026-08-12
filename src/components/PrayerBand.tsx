import { getTranslations } from "next-intl/server";
import { getPrayerTimesForDate } from "@/lib/prayer-times/loader";
import { hijriMonthSlug } from "@/lib/hijri";
import { formatPrayerDayLabel } from "@/lib/prayer-times/dateLabel";
import { getBerlinDateParts, timeToMinutes } from "@/lib/date";
import { PrayerGrid } from "./PrayerGrid";
import { ButtonLink } from "./Button";

/**
 * The recurring "sahn" band: today's six prayer times, repeated on every
 * page. Renders the "no times uploaded" state inline rather than hiding
 * itself, since CLAUDE.md requires that state to be visible, not silent
 * (Prayer times — never fall back, never interpolate).
 */
export async function PrayerBand({ locale }: { locale: string }) {
  const t = await getTranslations("prayerBand");
  const tHijriMonths = await getTranslations("hijri.months");

  const result = getPrayerTimesForDate(new Date());

  if (result.status !== "ok") {
    return (
      <div className="bg-primary-shade-1 px-4 py-6 text-secondary-shade-2 md:px-12 md:py-8">
        <div className="mb-2 text-[13px] uppercase tracking-[0.2em] text-secondary-shade-1">
          {t("todayLabel")}
        </div>
        <p className="text-sm">{t("noTimesUploaded")}</p>
      </div>
    );
  }

  const { day } = result;
  const { combined: dateLabel } = formatPrayerDayLabel(
    day,
    locale,
    tHijriMonths(hijriMonthSlug(day.hijri.month)),
  );

  return (
    <div className="bg-primary-shade-1 px-4 pb-9.5 pt-6.5 text-secondary-shade-2 md:px-12 md:pt-8.5">
      <div className="mb-5.5 flex flex-col gap-1 border-b border-secondary/50 pb-3 md:flex-row md:items-baseline md:justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-secondary-shade-1 md:text-[13px] md:tracking-[0.2em]">
          {t("todayLabel")}
        </div>
        <div className="text-xs text-secondary-shade-2/80 md:text-sm">{dateLabel}</div>
      </div>

      <PrayerGrid
        day={day}
        locale={locale}
        initialNowMinutes={timeToMinutes(getBerlinDateParts().hhmm)}
        monthTableLink={
          <ButtonLink href="/moschee/gebetszeiten" variant="utilityOnDark" className="shrink-0">
            {t("viewMonthTable")} <span className="inline-block rtl:-scale-x-100">→</span>
          </ButtonLink>
        }
      />
    </div>
  );
}
