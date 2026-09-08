import { NextRequest, NextResponse } from "next/server";
import { readCategoryIconMarkup } from "@/lib/content/categoryIcon";

/**
 * Serves the same filename-convention SVG lookup `CategoryIcon` used to do
 * synchronously during server rendering (CLAUDE.md: Content — "Icons by
 * filename convention... resolved at build time from the filesystem, not
 * with a browser-side error handler"). Announcement rendering had to move
 * client-side to consume `useAnnouncements`/`/api/announcements`, so this
 * route is how that same, single resolution function
 * (`readCategoryIconMarkup`) reaches it — the fallback logic still lives
 * in exactly one place, just called over HTTP instead of inline.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const markup = readCategoryIconMarkup(category);
  return new NextResponse(markup, {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
