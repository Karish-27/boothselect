import { defineConfig, loadEnv, type UserConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

// TanStack Start + Nitro build. Plugin order matters: tsconfig paths and
// Tailwind first, then TanStack Start, Nitro (build only), and the React
// plugin last.
export default defineConfig(({ command, mode }): UserConfig => {
  const isDev = command === "serve";

  // Expose VITE_* env vars to the client bundle.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    // In dev, scope NODE_ENV=development to the client only, so React DevTools
    // gets the dev react-dom without the SSR runtime emitting jsxDEV (which it
    // can't resolve). The build is left untouched.
    environments: isDev
      ? {
          client: {
            define: { "process.env.NODE_ENV": JSON.stringify("development") },
          },
        }
      : undefined,
    // Use Lightning CSS in dev and build alike so the dev preview matches the
    // built CSS output.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      // Keep a single copy of React / TanStack Query to avoid hydration issues.
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Redirect the bundled server entry to src/server.ts (our SSR wrapper).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      ...(command === "build" ? [nitro()] : []),
      viteReact(),
    ],
  };
});
