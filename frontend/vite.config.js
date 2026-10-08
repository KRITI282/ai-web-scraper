import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Any request starting with /api is forwarded to the backend,
// so the frontend can simply call fetch("/api/summarize").
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5000" },
  },
});
