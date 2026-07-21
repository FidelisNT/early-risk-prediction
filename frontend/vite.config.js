import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // These deprecation warnings come from Bootstrap 5.3's own SCSS
        // (it still uses the legacy @import syntax and a few old
        // color/math functions internally) - not from our theme.scss.
        // Silencing them here is cosmetic only; nothing about the actual
        // compiled CSS changes. Remove this once Bootstrap ships a
        // @use-based release.
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
        quietDeps: true,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 127.0.0.1 rather than "localhost" - on Windows, "localhost" can
      // resolve to the IPv6 ::1 first, which fails to connect if uvicorn
      // is only bound to the IPv4 127.0.0.1 address.
      "/admin": "http://127.0.0.1:8000",
      "/patient": "http://127.0.0.1:8000",
      "/institution": "http://127.0.0.1:8000",
    },
  },
});