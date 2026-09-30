import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project pages on GitHub Pages are served under /<repo-name>/, set via
  // BASE_PATH in the deploy-pages workflow. Defaults to "/" everywhere else.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    // Dev-only proxy: lets the dashboard call the API same-origin (VITE_API_BASE_URL="").
    // The production Dockerfile serves the built dashboard from Express instead.
    proxy: {
      "/api": "http://server:4000",
      "/webhooks": "http://server:4000",
      "/health": "http://server:4000",
    },
  },
});
