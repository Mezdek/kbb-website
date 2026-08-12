import fs from "node:fs";
import path from "node:path";

/**
 * Reads every `.md` file under `dir`, recursively, once at module load —
 * eagerly rather than per request, because a `readFileSync` on a path built
 * from a variable defeats static analysis, which then traces the whole
 * project into the deployment output. Shared by `content/document.ts`
 * (`content/<slug>/<lang>.md`) and `content/hausordnung.ts`
 * (`content/hausordnung/<lang>.md`) rather than each re-implementing the
 * same directory walk.
 *
 * Keys are the path relative to `dir`, without the `.md` extension, using
 * `/` regardless of platform — e.g. `impressum/de` or, for a loader rooted
 * directly at `content/hausordnung`, just `de`.
 */
export function loadMarkdownFiles(dir: string): ReadonlyMap<string, string> {
  const files = new Map<string, string>();

  function walk(current: string, prefix: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const key = path.basename(entry.name, ".md");
        files.set(prefix ? `${prefix}/${key}` : key, fs.readFileSync(entryPath, "utf-8"));
      }
    }
  }

  walk(dir, "");
  return files;
}
