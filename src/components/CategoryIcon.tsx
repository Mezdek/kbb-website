"use client";

import { useEffect, useState } from "react";

const CATEGORY_ICON_API_PATH = "/api/category-icons";

/**
 * Fetches the filename-convention SVG for `category` from
 * `/api/category-icons` and inlines its markup — the resolution itself
 * (`<category>.svg` if it exists, else `default.svg`) still happens on the
 * server via `readCategoryIconMarkup`, this just consumes it. Inlining
 * (rather than an `<img src>`) is required so `text-flair-shade-2` etc. can
 * tint the icon via `currentColor`, and this had to become a fetch because
 * `AnnouncementItem` — its only caller — now renders from client-fetched
 * announcement data (CLAUDE.md: Content — icons resolved from the
 * filesystem, never a browser-side error handler; that still holds, the
 * lookup is just server-side-over-HTTP now instead of server-side-inline).
 */
export function CategoryIcon({ category, className }: { category?: string; className?: string }) {
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const query = category ? `?category=${encodeURIComponent(category)}` : "";

    fetch(`${CATEGORY_ICON_API_PATH}${query}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : ""))
      .then(setMarkup)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      });

    return () => controller.abort();
  }, [category]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}
