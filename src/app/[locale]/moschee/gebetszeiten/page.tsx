import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ButtonLink } from "@/components/Button";
import { PrintButton } from "@/components/PrintButton";
import { PrayerTable } from "@/components/PrayerTable";
import { PrayerViewToggle } from "@/components/PrayerViewToggle";
import { PrayerDayView } from "@/components/PrayerDayView";
import { Ltr } from "@/components/Ltr";
import { getSiteConfig } from "@/lib/config";
import {
  getPrayerTimesForDate,
  getPrayerTimesForHijriMonth,
  getPrayerTimesForMonth,
} from "@/lib/prayer-times/loader";
import { getBerlinDateParts, timeToMinutes, withNativeNumerals, formatNumeral } from "@/lib/date";
import { formatHijriNumeral, hijriMonthSlug } from "@/lib/hijri";
import type { PrayerDay } from "@/lib/prayer-times/types";

const PRAYER_ORDER = ["fajr", "shuruq", "dhuhr", "asr", "maghrib", "isha"] as const;
const ROUTE = "/moschee/gebetszeiten";

function nextPrayerKey(day: PrayerDay): (typeof PRAYER_ORDER)[number] {
  const nowMinutes = timeToMinutes(getBerlinDateParts().hhmm);
  for (const key of PRAYER_ORDER) {
    if (timeToMinutes(day[key]) > nowMinutes) {
      return key;
    }
  }
  return PRAYER_ORDER[0];
}

function parseMonthParam(value: string | undefined, fallbackYear: number, fallbackMonth: number) {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (year && month && month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  return { year: fallbackYear, month: fallbackMonth };
}

function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

function monthParamValue({ year, month }: { year: number; month: number }): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseDateParam(value: string | undefined, fallback: string): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

// Shifting a day is plain Gregorian calendar arithmetic (adding/subtracting
// a day) — not a Hijri computation. Used only to pick which reference date
// to look up next, never to derive a Hijri value directly.
function shiftIsoDate(iso: string, deltaDays: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

export default async function GebetszeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; month?: string; date?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { view: viewParam, month: monthParam, date: dateParam } = await searchParams;

  const t = await getTranslations("prayerTimes");
  const tBand = await getTranslations("prayerBand");
  const tHijriMonths = await getTranslations("hijri.months");
  const config = getSiteConfig();

  const { isoDate: todayIso } = getBerlinDateParts();
  const [todayYearStr, todayMonthStr] = todayIso.split("-");
  const currentYear = Number(todayYearStr);
  const currentMonth = Number(todayMonthStr);
  const numeralLocale = withNativeNumerals(locale);

  const view: "gregorian" | "hijri" = viewParam === "hijri" ? "hijri" : "gregorian";

  const todayResult = getPrayerTimesForDate(new Date());
  const nextKey = todayResult.status === "ok" ? nextPrayerKey(todayResult.day) : null;

  // Mobile's single day is independent of the desktop `view`/month state —
  // it always shows one day, defaulting to today (CLAUDE.md:
  // /moschee/gebetszeiten, "it needs its own day-level navigation").
  const mobileDate = parseDateParam(dateParam, todayIso);
  const mobileResult = getPrayerTimesForDate(new Date(`${mobileDate}T12:00:00Z`));

  // Desktop data: one of two shapes depending on `view`.
  let desktopDays: PrayerDay[] = [];
  let desktopOk = false;
  let desktopMissing: ("start" | "end")[] = [];
  let desktopHeading = t("eyebrow");
  let prevHref: { pathname: string; query: Record<string, string> };
  let nextHref: { pathname: string; query: Record<string, string> };

  if (view === "gregorian") {
    const { year, month } = parseMonthParam(monthParam, currentYear, currentMonth);
    const prev = shiftMonth(year, month, -1);
    const next = shiftMonth(year, month, 1);
    const monthResult = getPrayerTimesForMonth(year, month);
    desktopOk = monthResult.status === "ok";
    if (monthResult.status === "ok") {
      desktopDays = monthResult.days;
    }
    desktopHeading = t("title", {
      month: new Intl.DateTimeFormat(numeralLocale, { month: "long" }).format(
        new Date(Date.UTC(year, month - 1, 1)),
      ),
      year: formatNumeral(year, locale),
    });
    prevHref = { pathname: ROUTE, query: { view, month: monthParamValue(prev) } };
    nextHref = { pathname: ROUTE, query: { view, month: monthParamValue(next) } };
  } else {
    const referenceDate = parseDateParam(dateParam, todayIso);
    const hijriResult = getPrayerTimesForHijriMonth(referenceDate);
    desktopOk = hijriResult.status === "ok";
    if (hijriResult.status === "ok") {
      desktopDays = hijriResult.days;
      desktopMissing = hijriResult.missing;
      const first = hijriResult.days[0]!;
      const last = hijriResult.days.at(-1)!;
      desktopHeading = t("title", {
        month: tHijriMonths(hijriMonthSlug(first.hijri.month)),
        year: formatHijriNumeral(first.hijri.year, locale),
      });
      prevHref = { pathname: ROUTE, query: { view, date: shiftIsoDate(first.date, -1) } };
      nextHref = { pathname: ROUTE, query: { view, date: shiftIsoDate(last.date, 1) } };
    } else {
      // No data to anchor on — step by roughly a month so the visitor can
      // still navigate away from an empty view, without computing anything
      // Hijri-specific.
      prevHref = { pathname: ROUTE, query: { view, date: shiftIsoDate(referenceDate, -30) } };
      nextHref = { pathname: ROUTE, query: { view, date: shiftIsoDate(referenceDate, 30) } };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary-shade-1">
      <div className="mx-auto w-full max-w-[1400px] bg-secondary-shade-2 shadow-[0_18px_48px_rgba(0,38,35,0.12)] print:shadow-none md:border md:border-secondary/60 print:border-0">
        <div className="print:hidden">
          <Header active="moschee" locale={locale} />
        </div>

        <div className="px-4 pt-9 md:px-10 print:px-0">
          <div className="mb-2.5 text-xs uppercase tracking-[0.2em] text-text-secondary md:text-[12px]">
            {t("eyebrow")}
          </div>
          <h1 className="mb-2.5 text-[26px] font-normal text-primary md:text-[34px]">{desktopHeading}</h1>
          <p className="max-w-[62ch] text-sm leading-[1.65] text-text-secondary md:text-base print:hidden">
            {t("methodNote", {
              offset: formatNumeral(config.prayerTimes.iqamaOffsetMinutes.default, locale),
              fajrOffset: formatNumeral(config.prayerTimes.iqamaOffsetMinutes.fajr, locale),
            })}
          </p>
          <p className="mt-1 text-sm leading-[1.65] text-text-secondary md:text-base print:hidden">
            {t("fridayKhutbah", { time: config.fridayPrayer.khutbahTime })}
          </p>
          <div className="mt-4 hidden md:block">
            <PrayerViewToggle view={view} />
          </div>
        </div>

        {todayResult.status === "ok" ? (
          <div className="mx-4 mt-7 flex flex-wrap items-center justify-between gap-4 bg-primary-shade-1 px-5 py-5 text-secondary-shade-2 md:mx-10 print:hidden">
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-secondary-shade-1">
                {t("todayCallout", {
                  date: new Intl.DateTimeFormat(numeralLocale, {
                    day: "numeric",
                    month: "long",
                  }).format(new Date(`${todayResult.day.date}T12:00:00Z`)),
                })}
              </div>
              <div className="text-[15px] md:text-base">
                {tBand("nextPrayer")}:{" "}
                <strong className="font-medium">
                  {tBand(`names.${nextKey!}`)} <Ltr>{todayResult.day[nextKey!]}</Ltr>
                </strong>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="hidden gap-2.5 md:flex">
                <ButtonLink href={prevHref} variant="utilityOnDark" aria-label={t("table.switchMonth")}>
                  ‹
                </ButtonLink>
                <ButtonLink href={nextHref} variant="utilityOnDark" aria-label={t("table.switchMonth")}>
                  ›
                </ButtonLink>
              </div>
              <PrintButton variant="utilityOnDark">⎙ {t("table.printA4")}</PrintButton>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-7 bg-primary-shade-1 px-5 py-5 text-secondary-shade-2 md:mx-10 print:hidden">
            <p className="text-sm">{tBand("noTimesUploaded")}</p>
          </div>
        )}

        <div className="py-8 md:px-10 md:py-11 print:px-0">
          <div className="hidden px-4 md:block md:px-0 print:block print:px-4">
            {desktopOk ? (
              <>
                <PrayerTable
                  days={desktopDays}
                  todayIso={todayIso}
                  locale={locale}
                  mode={view}
                  missing={desktopMissing}
                />
                <div className="mt-4.5 text-sm text-text-secondary print:hidden">{t("table.note")}</div>
              </>
            ) : (
              <p className="text-sm text-text-secondary">{tBand("noTimesUploaded")}</p>
            )}
          </div>

          {mobileResult.status === "ok" ? (
            <PrayerDayView day={mobileResult.day} todayIso={todayIso} locale={locale} />
          ) : (
            <div className="px-4 md:hidden print:hidden">
              <p className="text-sm text-text-secondary">{tBand("noTimesUploaded")}</p>
            </div>
          )}
        </div>

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
