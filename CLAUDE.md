# CLAUDE.md

Repository guidance for coding agents working on SVGlo.

## Project overview

SVGlo is a multilingual image-to-SVG converter built with React 18, Vite 5,
TypeScript, and visioncortex VTracer.

- The production output is a static site in `dist/`.
- Image decoding and vectorization run locally in the browser.
- Images are never uploaded to an application server.
- The converter still requires JavaScript, Canvas, and WebAssembly; “static”
  refers to hosting, not a JavaScript-free application.
- The VTracer 1.0 WebAssembly package is vendored in
  `vendor/vtracer-wasm-pkg/` (built from upstream `vtracer/nodejs` with
  `wasm-pack --target web`), so normal installs and builds do not require
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
English and Simplified Chinese routes, and asserts that SVG paths were
generated. It requires Google Chrome to be installed.

## Architecture

```text
Static host
  └─ English and Simplified Chinese HTML + JS + CSS + WASM
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
   initializes the 1.0 module, reads RGBA from the canvas, and calls
   `vectorize_rgba` (exposed as `convertPixels` in the Node package).
4. `src/components/PreviewPane.tsx` keeps the working canvas mounted and
   mounts the returned SVG string into a host element (`#vt-svg`).

### DOM ownership constraint

- `#vt-canvas` is the pixel source. Keep it mounted (hidden is fine).
- `#vt-svg` is stamped onto the inlined preview root for e2e/styling. The
  host’s children are written imperatively from the SVG string — do not put
  React-managed nodes inside the host, and do not key/remount the canvas
  when settings change.

### Parameter mapping (1.0)

`buildOptions()` in `src/lib/vtracer.ts` passes UI values in the same units
as the Rust `Config` / Node bindings. Do **not** re-apply the old webapp
transforms (no speckle squaring, no `8 - bits`, no degree→radian):

| UI field | Sent to WebAssembly |
|---|---|
| `clustering` | `"color-cluster" \| "bw" \| "watershed"` |
| `filter_speckle` | side length (framework squares it) |
| `color_precision` | significant bits 1..=8 |
| `corner_threshold` / `splice_threshold` | degrees |
| `simplify` | pixel tolerance; omitted when off |
| `watershed_detail` | 0..=255 hierarchy cut |

Presets in `src/lib/presets.ts` contain IDs and converter configs. Their names
and descriptions come from the typed catalogs under `src/i18n/`.

## Localized content and SEO

| File | Responsibility |
|---|---|
| `src/i18n/en.ts` | Typed English UI copy |
| `src/i18n/zhCN.ts` | Typed Simplified Chinese UI copy |
| `src/i18n/types.ts` | Copy schema and dot-path message keys |
| `src/i18n/index.ts` | Path-based locale selection, typed `t()` lookup, and content exports |
| `src/i18n/article.ts` | English article and FAQ content |
| `src/i18n/article.zhCN.ts` | Simplified Chinese article and FAQ content |
| `vite-plugin-static-html.ts` | Metadata, JSON-LD, SEO shell, sitemap, robots, and static 404 |

English remains the default at `/`. Simplified Chinese is served at `/zh-cn/`,
`/zh-cn/svg-to-jpg/`, and `/zh-cn/svg-to-png/`. The active locale is derived
from the pathname, and the header contains a current-language dropdown that
switches to the matching route in another language.

The Vite plugin injects localized metadata and a matching text content shell
into each language entry. Crawlers and browsers without JavaScript therefore
receive meaningful HTML; React replaces that shell when the application mounts.

Expected build output:

```text
dist/
  index.html
  zh-cn/index.html
  zh-cn/svg-to-jpg/index.html
  zh-cn/svg-to-png/index.html
  404.html
  robots.txt
  sitemap.xml
  assets/
```

Unknown paths must remain real 404 responses. Do not add a catch-all SPA
rewrite.

The canonical origin defaults to `https://svglo.com`. Override it for a
different production origin when building:

```sh
SITE_URL=https://preview.example.com npm run build
```

`VITE_SITE_URL` is also supported, but `SITE_URL` is preferred for build
configuration because the value is not used by browser code.

## Vite and WebAssembly constraints

- Keep `optimizeDeps.exclude: ['vtracer-wasm']`; it allows the WASM `?url`
  asset import to resolve correctly.
- Keep the production target at `es2020` unless browser support requirements
  are intentionally changed.
- The vendored WASM package is referenced through the local
  `file:vendor/vtracer-wasm-pkg` dependency.
- Conversion is a synchronous wasm call after init. Yield to the event loop
  before calling it so the running overlay can paint; long-term, move the
  call into a Web Worker if large photos stall the main thread.
- Do not add server-side image processing or an upload endpoint unless the
  product architecture is explicitly changed.

## Updating the vendored WASM package

This repository does not contain the Rust source checkout. Updating the
vendored package requires a separate checkout of upstream VTracer and
`wasm-pack`. Build the **nodejs** crate for the browser (not the legacy
`webapp/`):

```sh
SVGLO_REPO=/absolute/path/to/svglo
VTRACER_REPO=/absolute/path/to/vtracer

cd "$VTRACER_REPO/nodejs"
wasm-pack build --target web --release --out-dir pkg-web
rm -rf "$SVGLO_REPO/vendor/vtracer-wasm-pkg"
mkdir -p "$SVGLO_REPO/vendor/vtracer-wasm-pkg"
cp pkg-web/vtracer_wasm.js \
   pkg-web/vtracer_wasm.d.ts \
   pkg-web/vtracer_wasm_bg.wasm \
   pkg-web/vtracer_wasm_bg.wasm.d.ts \
   "$SVGLO_REPO/vendor/vtracer-wasm-pkg/"
# Keep package.json name as `vtracer-wasm` (see existing vendor file).
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
metadata. Do not copy wasm-pack’s generated `.gitignore` (`*`) into vendor.

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
