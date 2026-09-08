"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/lib/content/announcements";

/**
 * Where announcements come from. Content used to be hand-authored JSON
 * files read from disk at build time; that folder is gone. This is a
 * placeholder for whatever real backend replaces it (a database, a
 * headless CMS, another service) — keeping the path in one exported
 * constant means swapping it later is a one-line change here, not a
 * find-and-replace across every caller (CLAUDE.md absolute rule 7: one
 * source of truth per fact).
 */
export const ANNOUNCEMENTS_API_PATH = "/api/announcements";

export interface UseAnnouncementsResult {
  announcements: Announcement[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetches every announcement from `ANNOUNCEMENTS_API_PATH` once on mount.
 * Filtering, sorting and pagination are the caller's job (see
 * `sortAnnouncements`, `filterByCategory` in `@/lib/content/announcements`)
 * — this hook only owns the fetch and its loading/error state.
 */
export function useAnnouncements(): UseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetch(ANNOUNCEMENTS_API_PATH, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load announcements (${response.status})`);
        }
        return response.json() as Promise<Announcement[]>;
      })
      .then((data) => setAnnouncements(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err : new Error("Failed to load announcements"));
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { announcements, isLoading, error };
}
