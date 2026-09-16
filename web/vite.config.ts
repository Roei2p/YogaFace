import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project pages on GitHub Pages are served under /<repo-name>/, set via
  // BASE_PATH in the deploy-pages workflow. Defaults to "/" everywhere else.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: { port: 5173 },
});
