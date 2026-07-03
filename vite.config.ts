import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The wasm-pack output uses top-level wasm features; keep it out of
  // esbuild's dep pre-bundling so the `?url` asset import resolves cleanly.
  optimizeDeps: {
    exclude: ['vtracer-webapp'],
  },
  build: {
    target: 'es2020',
  },
});
