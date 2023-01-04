import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { ViteEjsPlugin } from "vite-plugin-ejs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    ViteEjsPlugin((viteConfig) => ({
      // viteConfig is the current Vite resolved config
      env: viteConfig.env,
    })),
  ],
  resolve: {
    //browserField: false,
  },
  worker: {
    format: 'iife',
  }
});
