import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localeHtmlPlugin } from './vite-plugin-locale-html';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localeHtmlPlugin()],
  // The wasm-pack output uses top-level wasm features; keep it out of
  // esbuild's dep pre-bundling so the `?url` asset import resolves cleanly.
  optimizeDeps: {
    exclude: ['vtracer-webapp'],
  },
  build: {
    target: 'es2020',
  },
  // Serve /en/ and /zh/ as the SPA entry during dev (middleware handles /).
  appType: 'spa',
});
