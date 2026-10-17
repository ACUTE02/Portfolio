/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "./" so the same build works at ACUTE02.github.io and at ACUTE02.github.io/<repo>/.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          /node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)
            ? "react-vendor"
            : /node_modules[\/](three|@react-three|its-fine|react-reconciler|suspend-react|react-use-measure|debounce|use-sync-external-store|zustand)[\/]/.test(id)
              ? "three-vendor"
              : undefined,
      },
    },
  },
  test: { environment: "jsdom", setupFiles: ["./src/setup.ts"], css: false },
});
