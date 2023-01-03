import { defineConfig, splitVendorChunkPlugin } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), splitVendorChunkPlugin()],
  resolve: {
    browserField: false,
  },
  worker: {
    format: 'iife',
  }
});
