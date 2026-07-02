import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function stampServiceWorker(): Plugin {
  return {
    name: "stamp-service-worker",
    apply: "build",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const buildId = createHash("sha256")
          .update(Object.keys(bundle).sort().join("\n"))
          .digest("hex")
          .slice(0, 8);
        const source = readFileSync(resolve(import.meta.dirname, "service-worker.js"), "utf8");
        this.emitFile({
          type: "asset",
          fileName: "service-worker.js",
          source: source.replaceAll("__BUILD_ID__", buildId),
        });
      },
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), stampServiceWorker()],
  server: { host: true },
  test: { environment: "node" },
});
