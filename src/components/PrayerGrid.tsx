"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { getBerlinDateParts, timeToMinutes, formatDuration } from "@/lib/date";
import { Ltr } from "./Ltr";
import type { PrayerDay } from "@/lib/prayer-times/types";

const PRAYER_KEYS = ["fajr", "shuruq", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = (typeof PRAYER_KEYS)[number];

function getCurrentPrayer(
  day: PrayerDay,
  nowMinutes: number,
): { key: PrayerKey; nextKey: PrayerKey } {
  const times = PRAYER_KEYS.map((key) => ({ key, minutes: timeToMinutes(day[key]) }));
  let current = times[times.length - 1]!;
  for (let i = 0; i < times.length; i++) {
    if (nowMinutes >= times[i]!.minutes) {
      current = times[i]!;
    }
  }
  const currentIndex = times.findIndex((t) => t.key === current.key);
  const next = times[(currentIndex + 1) % times.length]!;
  return { key: current.key, nextKey: next.key };
}

/**
 * Renders the 6-cell prayer grid and highlights the current prayer,
 * ticking every 30s. This is the only client-timed piece of the prayer
 * band — everything else on the page stays server-rendered.
 *
 * `initialNowMinutes` comes from the server (PrayerBand), computed at the
 * same moment as `day`. The clock only starts ticking independently client-
 * side in the effect below, strictly *after* mount — never during the first
 * render. Seeding `useState` with a fresh `getBerlinDateParts()` call
 * instead (i.e. computing "now" independently on both sides) would make the
 * server and client disagree on the very first render whenever a minute
 * boundary falls between them, which React reports as a text-content
 * hydration mismatch. That gap is normally sub-second and easy to miss, but
 * this route is statically prerendered at build time (confirmed via
 * `npm run build`'s route table: `/de`, `/ar`, `/en` are marked SSG) — so
 * the server's "now" is frozen at build time and virtually never agrees
 * with the client's real one, making the mismatch fire on every load, not
 * just a rare race.
 */
export function PrayerGrid({
  day,
  locale,
  initialNowMinutes,
  monthTableLink,
}: {
  day: PrayerDay;
  locale: string;
  initialNowMinutes: number;
  monthTableLink?: ReactNode;
}) {
  const t = useTranslations("prayerBand");
  const [nowMinutes, setNowMinutes] = useState(initialNowMinutes);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMinutes(timeToMinutes(getBerlinDateParts().hhmm));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const { key: currentKey, nextKey } = getCurrentPrayer(day, nowMinutes);
  const nextMinutes = timeToMinutes(day[nextKey]);
  const wrappedNextMinutes = nextMinutes <= nowMinutes ? nextMinutes + 24 * 60 : nextMinutes;
  const remaining = wrappedNextMinutes - nowMinutes;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-px bg-secondary/35 md:grid-cols-6">
        {PRAYER_KEYS.map((key) => {
          const isCurrent = key === currentKey;
          return (
            <div
              key={key}
              className={`px-2 py-3.5 md:px-2 md:py-3.5 ${
                isCurrent ? "outline-1 outline-secondary bg-primary" : "bg-primary-shade-1"
              }`}
            >
              <div className="mb-1 text-[11px] uppercase tracking-widest text-secondary-shade-1 md:mb-2 md:text-[13px] md:tracking-[0.12em]">
                {t(`names.${key}`)}
              </div>
              <Ltr
                className={`block text-[22px] md:text-[30px] ${isCurrent ? "font-bold" : "font-normal"}`}
              >
                {day[key]}
              </Ltr>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] text-secondary-shade-2/85 md:text-sm">
          {t("nextPrayer")}{" "}
          <strong className="font-medium text-secondary-shade-2">
            {t("nextPrayerIn", {
              name: t(`names.${nextKey}`),
              duration: formatDuration(remaining, locale),
            })}
          </strong>
        </div>
        {monthTableLink}
      </div>
    </div>
  );
}
