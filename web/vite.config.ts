import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base44 sandbox only (see AGENTS.md): the API runs as its own compose service,
// so the dev server accepts the preview proxy's hostname and forwards API calls
// to keep the browser on a single origin. Unset -> unchanged behaviour.
const previewMode = process.env.BASE44_PREVIEW_MODE === "1";
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://api:4000";

export default defineConfig({
  // Project pages on GitHub Pages are served under /<repo-name>/, set via
  // BASE_PATH in the deploy-pages workflow. Defaults to "/" everywhere else.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    port: 5173,
    ...(previewMode && sandboxHostDomain
      ? {
          allowedHosts: [`.${sandboxHostDomain}`],
          proxy: {
            "/api": apiProxyTarget,
            "/webhooks": apiProxyTarget,
            "/health": apiProxyTarget,
          },
        }
      : {}),
  },
});
