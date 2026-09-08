import { NextResponse } from "next/server";
import type { Announcement } from "@/lib/content/announcements";

/**
 * Placeholder endpoint. Announcements used to be hand-authored JSON files
 * read from `content/announcements/` at build time; that content is gone
 * and this route is where whatever replaces it — a database, a headless
 * CMS, another service — should be wired in. Until then it returns an
 * empty list, which renders the site's normal "no announcements yet" empty
 * state instead of an error.
 */
export async function GET(): Promise<NextResponse<Announcement[]>> {
  const announcements: Announcement[] = [];
  return NextResponse.json(announcements);
}
