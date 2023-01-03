import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  resolve: {
    browserField: false,
  },
  worker: {
    format: 'iife',
  }
});
