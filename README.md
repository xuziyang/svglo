# SVGlo

**Live site: [https://svglo.com](https://svglo.com)**

A pure front-end image-to-SVG tool powered by the [visioncortex VTracer](https://github.com/visioncortex/vtracer) engine. All conversion runs locally in the browser (WebAssembly) — images are never uploaded.

## Architecture

```
Browser ──> static wasm + React + CSS (no backend)
         └─ upload image → wasm vectorizes in-browser → output SVG → download/copy
```

- **Core engine**: VTracer 1.0 (`vtracer/nodejs` crate, `wasm-pack --target web`) — MIT / Apache-2.0
- **Frontend**: React 18 + Vite 5 + TypeScript
- **No backend**: pure static hosting, zero server compute, naturally scalable, privacy-friendly

The browser calls `vectorize_rgba` (raw canvas pixels → SVG string), including 1.0 features such as watershed clustering and curve simplification.

## Prerequisites

1. [Rust](https://www.rust-lang.org/tools/install) + `wasm-pack`
2. Node.js 18+

## wasm package

The wasm package (`vendor/vtracer-wasm-pkg/`) is committed to the repo and works out of the box — no local Rust build required.

To update it (after upstream vtracer 1.0 changes):

```sh
cd ../vtracer/nodejs
wasm-pack build --target web --release --out-dir pkg-web
cp pkg-web/vtracer_wasm.js \
   pkg-web/vtracer_wasm.d.ts \
   pkg-web/vtracer_wasm_bg.wasm \
   pkg-web/vtracer_wasm_bg.wasm.d.ts \
   ../svglo/vendor/vtracer-wasm-pkg/
```

This project's `package.json` references it via `file:vendor/vtracer-wasm-pkg`.

## Develop & build

```sh
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build to dist/
npm run preview   # preview production build
npm run typecheck # type check
```

## Deploy

`npm run build` produces a pure static site in `dist/`, ready for any static host:

```text
dist/
  index.html             # English title, description, social tags, and SEO text shell
  404.html               # English static 404 (noindex); static hosts auto-serve it
  sitemap.xml
  robots.txt
  assets/...
```

### Cloudflare Pages (recommended)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |
| Env var `SITE_URL` | optional; defaults to `https://svglo.com` |

- wasm deps are vendored in-repo (`vendor/`), so CI needs no Rust step
- Build always emits absolute canonical and Open Graph URLs, plus `/robots.txt`, `/sitemap.xml`, and `/404.html`
- Unknown paths are served as HTTP 404 via `404.html` (Cloudflare Pages / Netlify / Vercel auto-detect this file)

### English content & SEO

SVGlo has one English page at `/`.

- The build emits real English metadata and a text SEO shell inside `#root`, so crawlers and no-JavaScript clients do not receive an empty page
- `robots.txt` allows the homepage and points at the single-URL sitemap
- Typed UI copy lives in `src/i18n/en.ts`; long-form article and FAQ copy lives in `src/i18n/article.ts`
- `vite-plugin-static-html.ts` injects metadata and the SEO shell, and emits the sitemap, robots file, and English 404 page

## Key integration points

- `src/lib/vtracer.ts`: wasm init + `buildOptions()` + `vectorize_rgba`. Units match the 1.0 Rust `Config` (no old webapp transforms).
- `src/hooks/useVTracer.ts`: state management with a sequence number so later requests supersede in-flight ones (fast param tweaks don't race).
- `src/components/PreviewPane.tsx`: working `<canvas>` supplies pixels; the SVG string is inlined into a host (`#vt-svg`). React does not manage that host’s children.

## Parameters

See the upstream [parameter docs](../vtracer/README.md) for meanings and use cases. Presets: Default / B&W Line Art / Poster / Photo / Pixel Art. Photo uses watershed + cutout + simplify by default.

> Tip: VTracer works best on icons, illustrations, and line art. Photos (continuous tone) produce large SVGs under default settings — use the Photo preset.

## License

- Core engine `vtracer`: MIT / Apache-2.0
- This frontend project: MIT — see [`LICENSE`](LICENSE)
