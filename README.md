# SVGlo

A pure front-end image-to-SVG tool powered by the [visioncortex VTracer](https://github.com/visioncortex/vtracer) engine. All conversion runs locally in the browser (WebAssembly) — images are never uploaded.

## Architecture

```
Browser ──> static wasm + React + CSS (no backend)
         └─ upload image → wasm vectorizes in-browser → output SVG → download/copy
```

- **Core engine**: `vtracer/webapp` Rust crate compiled to wasm (MIT / Apache-2.0)
- **Frontend**: React 18 + Vite 5 + TypeScript
- **No backend**: pure static hosting, zero server compute, naturally scalable, privacy-friendly

The wasm `ColorImageConverter` / `BinaryImageConverter` run in `tick()` slices and report progress so the UI main thread stays responsive.

## Prerequisites

1. [Rust](https://www.rust-lang.org/tools/install) + `wasm-pack`
2. Node.js 18+

## wasm package

The wasm package (`vendor/vtracer-webapp-pkg/`) is committed to the repo and works out of the box — no local Rust build required.

To update it (after upstream vtracer changes):

```sh
cd ../vtracer/webapp
wasm-pack build --target web --release
# output: ../vtracer/webapp/pkg/
cp -r ../vtracer/webapp/pkg/* vendor/vtracer-webapp-pkg/
```

This project's `package.json` references it via `file:vendor/vtracer-webapp-pkg`.

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
  index.html             # English — title, description, hreflang, SEO shell in source HTML
  zh-cn/index.html       # Chinese — same shape
  en/index.html          # legacy soft redirect → /
  zh/index.html          # legacy soft redirect → /zh-cn/
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
- `public/_redirects` sends legacy `/en` → `/`, `/zh` → `/zh-cn/`, and normalizes `/zh-cn` → `/zh-cn/` (Cloudflare Pages / Netlify)
- `vercel.json` does the same on Vercel
- Build always emits absolute `canonical` / `hreflang` / Open Graph URLs, plus `/robots.txt` and `/sitemap.xml`

### Internationalization & SEO

Supported locales: **English** (`/`, default) and **Simplified Chinese** (`/zh-cn/`).

- Build emits **separate static HTML** per locale (not an empty SPA shell). Crawlers see the correct `lang`, `<title>`, meta description, `canonical`, `hreflang`, and a text SEO shell inside `#root` without running JS
- English is unprefixed at the site root; Chinese lives under `/zh-cn/`
- Legacy `/en/` permanently redirects to `/`; legacy `/zh/` permanently redirects to `/zh-cn/`
- `robots.txt` allows all pages and points at the sitemap; `sitemap.xml` lists both locales with `xhtml:link` hreflang alternates, `lastmod`, and priority
- Header language switch performs a real navigation to the other locale’s HTML (correct share-preview meta)
- Copy lives in typed catalogs under `src/i18n/` (`en.ts`, `zh.ts`); the Vite plugin `vite-plugin-locale-html.ts` reads the same catalogs at build time
- To add a language: new catalog + `Locale` union + `LOCALES` / `catalogs` / `LOCALE_PATH_SEGMENT` in `src/i18n/index.ts`, then rebuild

## Key integration points

- `src/lib/vtracer.ts`: wasm init + param transforms + tick loop. Mirrors the original webapp's parameter conversion (`filter_speckle` squared, `color_precision` inverted, angles to radians).
- `src/hooks/useVTracer.ts`: state management with a sequence number so later requests supersede in-flight ones (fast param tweaks don't race).
- `src/components/PreviewPane.tsx`: working `<canvas>` (wasm reads pixels) and `<svg>` (wasm writes paths) stay mounted; React does not manage the svg's children.

## Parameters

See the upstream [parameter docs](../vtracer/README.md) for meanings and use cases. Presets: Default / B&W Line Art / Poster / Photo / Pixel Art.

> Tip: VTracer works best on icons, illustrations, and line art. Photos (continuous tone) produce large SVGs under default settings — use the Photo preset.

## License

- Core engine `vtracer`: MIT / Apache-2.0
- This frontend project: MIT — see [`LICENSE`](LICENSE)
