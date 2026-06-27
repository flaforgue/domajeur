import { defineConfig, globalIgnores } from "eslint/config";
import reactConfig from "@flaforgue/eslint-config-react";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "vite.config.js", "vite.config.d.ts", "**/*.tsbuildinfo"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactConfig],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/index.css",
      },
    },
  },
]);
