import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "resolve-legacy-lib",
        enforce: "pre",
        resolveId(source) {
          const normalized = source.replace(/\\/g, "/");
          if (normalized.includes("/src/lib/")) {
            const mapping: Record<string, string> = {
              "utils": path.resolve(__dirname, "./src/utils/utils.ts"),
              "api": path.resolve(__dirname, "./src/services/api.ts"),
              "api-backend": path.resolve(__dirname, "./src/services/api.ts"),
              "auth": path.resolve(__dirname, "./src/context/AuthContext.tsx"),
              "mock-data": path.resolve(__dirname, "./src/services/mockData.ts"),
              "error-capture": path.resolve(__dirname, "./src/utils/error-capture.ts"),
              "error-page": path.resolve(__dirname, "./src/utils/error-page.ts"),
            };
            const parts = normalized.split("/src/lib/");
            const key = parts[parts.length - 1];
            const resolved = mapping[key];
            if (resolved) {
              return resolved;
            }
          }
          return null;
        },
      },
    ],
  },
});
