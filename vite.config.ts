import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { staticHtmlPlugin } from './vite-plugin-static-html';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), staticHtmlPlugin()],
  // The wasm-pack output uses top-level wasm features; keep it out of
  // esbuild's dep pre-bundling so the `?url` asset import resolves cleanly.
  optimizeDeps: {
    exclude: ['vtracer-wasm'],
  },
  build: {
    target: 'es2020',
  },
  // Single English entry point; all processing remains client-side.
  appType: 'spa',
});
