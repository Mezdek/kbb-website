import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { hijriMonthSlug } from "@/lib/hijri";
import { formatPrayerDayLabel } from "@/lib/prayer-times/dateLabel";
import { Ltr } from "./Ltr";
import type { PrayerDay } from "@/lib/prayer-times/types";

const PRAYER_ORDER = ["fajr", "shuruq", "dhuhr", "asr", "maghrib", "isha"] as const;

/**
 * Mobile's single-day view (CLAUDE.md: /moschee/gebetszeiten — "mobile is a
 * single day per page ... it needs its own day-level navigation, since the
 * desktop month arrows do not apply"). Shifting by a day is plain Gregorian
 * calendar arithmetic, not a Hijri computation — the Hijri date shown comes
 * from the next/previous day's own data once navigated to, never derived
 * here.
 */
export async function PrayerDayView({
  day,
  todayIso,
  locale,
}: {
  day: PrayerDay;
  todayIso: string;
  locale: string;
}) {
  const t = await getTranslations("prayerBand");
  const tTable = await getTranslations("prayerTimes.table");
  const tMobile = await getTranslations("prayerTimes.mobile");
  const tHijriMonths = await getTranslations("hijri.months");

  const { weekday, gregorianLabel, hijriLabel } = formatPrayerDayLabel(
    day,
    locale,
    tHijriMonths(hijriMonthSlug(day.hijri.month)),
  );
  const isToday = day.date === todayIso;
  const previousDate = shiftIsoDate(day.date, -1);
  const nextDate = shiftIsoDate(day.date, 1);

  return (
    <div className="md:hidden print:hidden">
      <div className="flex items-center justify-between gap-2 border-b border-secondary/45 px-2 py-4">
        <Link
          href={{ pathname: "/moschee/gebetszeiten", query: { date: previousDate } }}
          aria-label={tMobile("previousDay")}
          className="px-3 py-2 text-lg text-primary no-underline"
        >
          ‹
        </Link>
        <div className="text-center">
          <div className="text-base font-medium text-primary">
            {weekday}
            {isToday && (
              <span className="ms-2 text-xs uppercase tracking-[0.1em] text-text-secondary">
                {tTable("today")}
              </span>
            )}
          </div>
          <div className="text-sm text-text-secondary">{gregorianLabel}</div>
          <div className="text-sm text-text-secondary">{hijriLabel}</div>
        </div>
        <Link
          href={{ pathname: "/moschee/gebetszeiten", query: { date: nextDate } }}
          aria-label={tMobile("nextDay")}
          className="px-3 py-2 text-lg text-primary no-underline"
        >
          ›
        </Link>
      </div>
      <div className="flex flex-col">
        {PRAYER_ORDER.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between border-b border-secondary/30 px-4 py-3.5"
          >
            <span className="text-text-secondary">{t(`names.${key}`)}</span>
            <Ltr className="text-lg text-text-body">{day[key]}</Ltr>
          </div>
        ))}
      </div>
    </div>
  );
}

function shiftIsoDate(iso: string, deltaDays: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}
