import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react()],

  // ── Path aliases ────────────────────────────────────────────────────────────
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@context": path.resolve(__dirname, "./src/context"),
    },
  },

  // ── Production build optimisations ─────────────────────────────────────────
  build: {
    // Target modern Chromium (WebView2 on Windows)
    target: ["es2021", "chrome100"],
    // Use esbuild for fast, small output
    minify: "esbuild",
    // Raise chunk-size warning threshold (vendor chunks are expected to be larger)
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split vendor bundles so the main chunk stays tiny
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "motion": ["framer-motion"],
          "icons": ["lucide-react"],
        },
        // Content-hash file names for optimal cache invalidation
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    // Omit sourcemaps in production for a leaner bundle
    sourcemap: false,
  },

  // ── Dev server ──────────────────────────────────────────────────────────────
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
