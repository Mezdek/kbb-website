import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Vitest's own defaults don't exclude .next — output:"standalone"
    // copies the whole src/ tree (including *.test.ts) into
    // .next/standalone, so a local `npm run build` before `npm test`
    // would otherwise silently double-run every test.
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
