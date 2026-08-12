import fs from "node:fs";
import path from "node:path";

const ICONS_DIR = path.join(process.cwd(), "content", "icons", "categories");
const DEFAULT_ICON_PATH = path.join(ICONS_DIR, "default.svg");

/**
 * `<category>.svg` if it exists, else the default (rub-el-hizb star) icon —
 * resolved from the filesystem at render time, not a browser `onError`
 * handler (CLAUDE.md: Content). An announcement with no category at all
 * (the field is optional) also gets the default icon.
 */
export function resolveCategoryIconPath(category: string | undefined): string {
  if (!category) {
    return DEFAULT_ICON_PATH;
  }
  const candidate = path.join(ICONS_DIR, `${category}.svg`);
  return fs.existsSync(candidate) ? candidate : DEFAULT_ICON_PATH;
}

export function readCategoryIconMarkup(category: string | undefined): string {
  return fs.readFileSync(resolveCategoryIconPath(category), "utf-8");
}
