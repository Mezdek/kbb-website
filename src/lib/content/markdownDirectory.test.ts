import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadMarkdownFiles } from "./markdownDirectory";

describe("loadMarkdownFiles", () => {
  it("keys flat files by their basename", () => {
    const files = loadMarkdownFiles(path.join(process.cwd(), "content", "hausordnung"));
    expect(files.has("de")).toBe(true);
    expect(files.get("de")).toContain("#");
  });

  describe("against an isolated fixture directory", () => {
    let dir: string;

    beforeEach(() => {
      // A temp fixture rather than a real `content/` subtree — this loader's
      // subdirectory-walking behaviour shouldn't depend on which content
      // folders happen to be nested today.
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "markdown-directory-test-"));
      fs.mkdirSync(path.join(dir, "some-doc"));
      fs.writeFileSync(path.join(dir, "some-doc", "de.md"), "# Titel");
      fs.writeFileSync(path.join(dir, "de.md"), "# Titel");
      fs.writeFileSync(path.join(dir, "notes.json"), "{}");
    });

    afterEach(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it("keys files in subdirectories by their relative path", () => {
      const files = loadMarkdownFiles(dir);
      expect(files.has("some-doc/de")).toBe(true);
    });

    it("keys flat files at the root by their basename", () => {
      const files = loadMarkdownFiles(dir);
      expect(files.has("de")).toBe(true);
    });

    it("ignores non-Markdown files", () => {
      const files = loadMarkdownFiles(dir);
      expect([...files.keys()].every((key) => !key.endsWith(".json"))).toBe(true);
      expect(files.has("notes")).toBe(false);
    });
  });
});
