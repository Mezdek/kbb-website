import { describe, expect, it } from "vitest";
import { loadMarkdownFiles } from "./markdownDirectory";
import path from "node:path";

describe("loadMarkdownFiles", () => {
  it("keys flat files by their basename", () => {
    const files = loadMarkdownFiles(path.join(process.cwd(), "content", "hausordnung"));
    expect(files.has("de")).toBe(true);
    expect(files.get("de")).toContain("#");
  });

  it("keys files in subdirectories by their relative path", () => {
    const files = loadMarkdownFiles(path.join(process.cwd(), "content"));
    expect(files.has("impressum/de")).toBe(true);
  });

  it("ignores non-Markdown files", () => {
    const files = loadMarkdownFiles(path.join(process.cwd(), "content"));
    expect([...files.keys()].every((key) => !key.endsWith(".json"))).toBe(true);
  });
});
