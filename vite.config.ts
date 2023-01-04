import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { ViteEjsPlugin } from "vite-plugin-ejs";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    ViteEjsPlugin((viteConfig) => ({
      // viteConfig is the current Vite resolved config
      env: viteConfig.env,
    })),
  ],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "matrix-js-sdk",
    ]
  },
  worker: {
    format: 'iife',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: true,
  }
});
