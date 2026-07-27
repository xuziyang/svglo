# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SVGlo is a pure front-end image→SVG converter. Conversion runs entirely in the browser via WebAssembly (visioncortex VTracer). There is **no backend** and no image upload.

Stack: React 18 + Vite 5 + TypeScript. Deploy target: static hosts (Cloudflare Pages recommended).

## Commands

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # production → dist/ (single English static site)
npm run preview      # serve dist/
npm run typecheck    # tsc --noEmit
```

Manual e2e smoke (Playwright with installed Google Chrome):

```sh
npm run build
node e2e-test.mjs    # starts preview on :4174, converts built-in example, asserts SVG paths
```

There is no unit-test runner and no lint script.

### Rebuild wasm (only when upstream vtracer changes)

The wasm package is **vendored** at `vendor/vtracer-webapp-pkg/` and referenced as `file:vendor/vtracer-webapp-pkg`. CI does not compile Rust.

```sh
cd ../vtracer/webapp
wasm-pack build --target web --release
cp -r ../vtracer/webapp/pkg/* vendor/vtracer-webapp-pkg/
```

Requires Rust + `wasm-pack`. Day-to-day frontend work does not need them.

### Production SEO env

Canonical, Open Graph, `sitemap.xml`, and `robots.txt` default to
`https://svglo.com`. Override only when needed:

```sh
SITE_URL=https://preview.example.com npm run build
```

## Architecture

```
Browser
  └─ static English HTML + JS/CSS/wasm
       ├─ upload image → draw to hidden <canvas>
       ├─ wasm reads canvas pixels, writes <path> into <svg> by id
       └─ serialize SVG → download / copy
```

### Conversion pipeline (hot path)

1. **`src/lib/vtracer.ts`** — sole bridge to wasm. Lazy-inits once via `ensureWasm()`. Builds JSON params for `ColorImageConverter` / `BinaryImageConverter`, then runs a time-sliced `tick()` loop (~25ms batches) so the UI stays responsive. Progress is throttled to integer-percent changes.
2. **`src/hooks/useVTracer.ts`** — React state around convert. Uses a monotonic sequence id so a newer `convert()` call supersedes in-flight work (rapid slider changes must not race).
3. **`src/App.tsx`** — owns image URL, dims, config; debounces config→reconvert (300ms); paints the source image onto the working canvas on load.
4. **`src/components/PreviewPane.tsx`** — always mounts the working `<canvas id="vt-canvas">` (hidden) and `<svg id="vt-svg">`. **React must never render children into that SVG** — wasm owns the path nodes imperatively. Never key/remount these elements on config change.

### Parameter transforms (easy to break)

User-facing units in `VTracerConfig` are **not** what wasm receives. `buildParams()` mirrors upstream `vtracer/webapp` `restart()`:

| UI field | Sent to wasm |
|---|---|
| `filter_speckle` (side length) | squared → area threshold |
| `color_precision` (significant bits 1–8) | `8 - bits` (“loss”) |
| `corner_threshold` / `splice_threshold` (degrees) | radians |

Presets live in `src/lib/presets.ts` as `id` + `config` only. Display names/descriptions come from the typed English copy catalog (`presets.${id}.*`).

### UI shell

- No React Router. One screen: hero+dropzone when no image; sidebar `ControlPanel` + `PreviewPane` when an image is loaded.
- Styling is plain CSS in `src/index.css` (design tokens as CSS variables). No component library.

## English copy & SEO (non-obvious)

| Piece | Role |
|---|---|
| `src/i18n/{en,types,index}.ts` | Typed English UI copy and `t()` lookup |
| `src/i18n/article.ts` | English article and FAQ content |
| `vite-plugin-static-html.ts` | Build/dev plugin: metadata, SEO shell, sitemap, robots, and 404 |

**Build output** (do not add a catch-all SPA rewrite; unknown paths should remain 404s):

```text
dist/index.html         # English title/description/social tags + SEO text shell
dist/404.html           # English static 404 (noindex)
dist/sitemap.xml
dist/robots.txt
```

Crawlers see real English content without JS. React mounts and replaces the SEO shell inside `#root`. The dev and preview servers return the generated English 404 page for unknown routes.

## Vite / wasm gotchas

- `optimizeDeps.exclude: ['vtracer-webapp']` is required so the `?url` wasm asset resolves.
- `build.target: 'es2020'`.
- Canvas and SVG **must keep stable ids** `vt-canvas` / `vt-svg` — wasm looks them up by id from the params JSON.

## Deploy (Cloudflare Pages)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Env `SITE_URL` | optional; defaults to `https://svglo.com` |

No Rust step in CI — wasm is vendored. Build emits `/robots.txt` and a
single-URL `/sitemap.xml` with absolute URLs.
