import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import type { ServerResponse } from 'node:http';
import { staticHtmlPlugin } from './vite-plugin-static-html';

// The VTracer wasm file is byte-stable per package version and ships under a
// content-hashed URL (`/assets/vtracer_wasm_bg-HASH.wasm`). Tag it as
// immutable so returning users only pay the ~675 KB download once. Apply
// the header in both dev and preview so prod-like behaviour is testable.
function wasmCacheHeaders() {
  return {
    name: 'wasm-cache-headers',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use((_req, res: ServerResponse, next) => {
        const url = _req.url ?? '';
        if (/^\/.*\/vtracer_wasm_bg-[\w-]+\.wasm$/.test(url) ||
            url.includes('/vtracer-wasm-pkg/vtracer_wasm_bg.wasm')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        next();
      });
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use((_req, res: ServerResponse, next) => {
        const url = _req.url ?? '';
        if (/^\/.*\/vtracer_wasm_bg-[\w-]+\.wasm$/.test(url)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), staticHtmlPlugin(), wasmCacheHeaders()],
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
