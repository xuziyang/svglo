# CLAUDE.md

Repository guidance for coding agents working on SVGlo.

## Project overview

SVGlo is an English-only image-to-SVG converter built with React 18, Vite 5,
TypeScript, and visioncortex VTracer.

- The production output is a static site in `dist/`.
- Image decoding and vectorization run locally in the browser.
- Images are never uploaded to an application server.
- The converter still requires JavaScript, Canvas, and WebAssembly; “static”
  refers to hosting, not a JavaScript-free application.
- The VTracer WebAssembly package is vendored in
  `vendor/vtracer-webapp-pkg/`, so normal installs and builds do not require
  Rust.

## Commands

```sh
npm install
npm run dev          # development server, normally http://localhost:5173
npm run typecheck    # TypeScript validation
npm run build        # production build → dist/
npm run preview      # serve the production build locally
```

There is no unit-test runner or lint script.

Run the end-to-end smoke test after building:

```sh
npm run build
node e2e-test.mjs
```

The smoke test starts a preview server on port 4174, opens the system Google
Chrome through Playwright, converts the built-in example image, verifies the
English-only UI and removed `/zh-cn/` route, and asserts that SVG paths were
generated. It requires Google Chrome to be installed.

## Architecture

```text
Static host
  └─ English HTML + JS + CSS + WASM
       └─ browser
            ├─ select, drop, or paste a local raster image
            ├─ decode it into a hidden canvas
            ├─ VTracer writes paths into the working SVG
            └─ serialize the SVG for download or clipboard copy
```

There is no React Router and no backend API. The UI has two states:

- Landing view: hero, local-image dropzone, and long-form article.
- Workspace view: `ControlPanel` and `PreviewPane`.

### Conversion pipeline

1. `src/App.tsx` owns the image object URL, dimensions, converter config, and
   preview state. It paints a newly selected image onto the canvas and
   debounces config-triggered reconversion by 300 ms.
2. `src/hooks/useVTracer.ts` wraps conversion in React state. Its monotonic
   sequence ID ensures a newer run supersedes any in-flight run.
3. `src/lib/vtracer.ts` is the only bridge to WebAssembly. It lazily
   initializes the module, builds converter parameters, and processes
   `tick()` calls in batches of roughly 25 ms.
4. `src/components/PreviewPane.tsx` keeps the working canvas and SVG mounted.

### DOM ownership constraint

The working elements must keep the IDs `vt-canvas` and `vt-svg`; VTracer
receives those IDs in its parameter JSON and looks up the nodes itself.

WebAssembly owns the child paths inside `vt-svg`. Do not render React children
into that SVG, and do not key or remount the canvas or SVG when settings
change.

### Parameter transforms

`buildParams()` in `src/lib/vtracer.ts` mirrors the upstream VTracer web app.
Do not pass all UI values through unchanged:

| UI field | Value sent to WebAssembly |
|---|---|
| `filter_speckle` | squared to produce an area threshold |
| `color_precision` | converted to loss with `8 - significantBits` |
| `corner_threshold` | converted from degrees to radians |
| `splice_threshold` | converted from degrees to radians |

Presets in `src/lib/presets.ts` contain IDs and converter configs. Their names
and descriptions come from the typed English catalog under `src/i18n/`.

## English content and SEO

| File | Responsibility |
|---|---|
| `src/i18n/en.ts` | Typed English UI copy |
| `src/i18n/types.ts` | Copy schema and dot-path message keys |
| `src/i18n/index.ts` | English `t()` lookup and content exports |
| `src/i18n/article.ts` | English article and FAQ content |
| `vite-plugin-static-html.ts` | Metadata, JSON-LD, SEO shell, sitemap, robots, and static 404 |

The `src/i18n/` directory name is retained for organization, but the product
does not have runtime locale state or a language switch.

The Vite plugin injects real English metadata and a text content shell into
`#root`. Crawlers and browsers without JavaScript therefore receive meaningful
HTML; React replaces that shell when the application mounts.

Expected build output:

```text
dist/
  index.html
  404.html
  robots.txt
  sitemap.xml
  assets/
```

Unknown paths must remain real 404 responses. Do not add a catch-all SPA
rewrite. In particular, `/zh-cn/` is no longer a valid route.

The canonical origin defaults to `https://svglo.com`. Override it for a
different production origin when building:

```sh
SITE_URL=https://preview.example.com npm run build
```

`VITE_SITE_URL` is also supported, but `SITE_URL` is preferred for build
configuration because the value is not used by browser code.

## Vite and WebAssembly constraints

- Keep `optimizeDeps.exclude: ['vtracer-webapp']`; it allows the WASM `?url`
  asset import to resolve correctly.
- Keep the production target at `es2020` unless browser support requirements
  are intentionally changed.
- The vendored WASM package is referenced through the local
  `file:vendor/vtracer-webapp-pkg` dependency.
- Do not add server-side image processing or an upload endpoint unless the
  product architecture is explicitly changed.

## Updating the vendored WASM package

This repository does not contain the Rust source checkout. Updating the
vendored package requires a separate checkout of upstream VTracer and
`wasm-pack`:

```sh
SVGLO_REPO=/absolute/path/to/svglo
VTRACER_REPO=/absolute/path/to/vtracer

cd "$VTRACER_REPO/webapp"
wasm-pack build --target web --release
cp -R pkg/. "$SVGLO_REPO/vendor/vtracer-webapp-pkg/"
```

After copying the package, run:

```sh
cd "$SVGLO_REPO"
npm install
npm run typecheck
npm run build
node e2e-test.mjs
```

Review the vendored package diff before committing it, especially the generated
JavaScript bindings, TypeScript declarations, `.wasm` binary, and package
metadata.

## Deployment

Any static host can serve `dist/`. For Cloudflare Pages:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | repository root |
| `SITE_URL` | optional; defaults to `https://svglo.com` |

`public/_redirects` intentionally contains no SPA fallback. The generated
`404.html` is the fallback document for hosts that support conventional static
404 pages.

## Completion checklist

For changes that affect UI behavior, conversion, copy, SEO, or build output:

1. Run `npm run typecheck`.
2. Run `npm run build`.
3. Check `git diff --check`.
4. Run `node e2e-test.mjs` when Google Chrome is available.
5. Confirm that unrelated user changes remain untouched.
