import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { articleContent, en } from './src/i18n';

export const DEFAULT_SITE_URL = 'https://svglo.com';

const HAS_EXTENSION_RE = /\.[a-zA-Z0-9]+$/;
const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_ALT = 'SVGlo — free online SVG converter for PNG, JPG, and other images';

function siteOrigin(): string {
  const raw = process.env.SITE_URL ?? process.env.VITE_SITE_URL;
  return (raw?.trim().replace(/\/+$/, '') || DEFAULT_SITE_URL);
}

function escapeMarkup(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function canonicalUrl(origin = siteOrigin()): string {
  return `${origin}/`;
}

export function buildJsonLd(origin = siteOrigin()): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'SVGlo',
        url: canonicalUrl(origin),
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and WebAssembly',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: en.meta.description,
        image: `${origin}${OG_IMAGE_PATH}`,
        inLanguage: 'en',
      },
      {
        '@type': 'FAQPage',
        mainEntity: articleContent.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  const json = JSON.stringify(graph).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

export function buildHeadTags(origin = siteOrigin()): string {
  const canonical = canonicalUrl(origin);
  const image = `${origin}${OG_IMAGE_PATH}`;

  return [
    `<meta name="description" content="${escapeMarkup(en.meta.description)}" />`,
    `<link rel="canonical" href="${escapeMarkup(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SVGlo" />`,
    `<meta property="og:title" content="${escapeMarkup(en.meta.title)}" />`,
    `<meta property="og:description" content="${escapeMarkup(en.meta.description)}" />`,
    `<meta property="og:url" content="${escapeMarkup(canonical)}" />`,
    `<meta property="og:image" content="${escapeMarkup(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeMarkup(OG_IMAGE_ALT)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeMarkup(en.meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeMarkup(en.meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeMarkup(image)}" />`,
    buildJsonLd(origin),
  ].join('\n    ');
}

/** Static English content for crawlers and browsers with JavaScript disabled. */
export function buildSeoShell(): string {
  const steps = articleContent.steps
    .map(
      (step) =>
        `          <li>\n            <h3>${escapeMarkup(step.title)}</h3>\n            <p>${escapeMarkup(step.body)}</p>\n          </li>`,
    )
    .join('\n');

  const sections = articleContent.sections
    .map(
      (section) =>
        `        <section class="article-copy-section" aria-labelledby="article-${section.id}">\n          <h3 id="article-${section.id}">${escapeMarkup(section.title)}</h3>\n          <div class="article-copy-body">\n${section.paragraphs
          .map((paragraph) => `            <p>${escapeMarkup(paragraph)}</p>`)
          .join('\n')}\n          </div>\n        </section>`,
    )
    .join('\n');

  const faq = articleContent.faq
    .map(
      (item) =>
        `        <details>\n          <summary><h3>${escapeMarkup(item.q)}</h3></summary>\n          <p>${escapeMarkup(item.a)}</p>\n        </details>`,
    )
    .join('\n');

  return `<div class="seo-shell">
      <header class="seo-shell-header">
        <strong>SVGlo</strong>
        <span> — ${escapeMarkup(en.header.tagline)}</span>
      </header>
      <main class="seo-shell-main">
        <h1>${escapeMarkup(en.hero.titleBefore)} <span>${escapeMarkup(en.hero.titleAccent)}</span></h1>
        <p>${escapeMarkup(en.hero.lead)}</p>
        <ul>
          <li>${escapeMarkup(en.hero.featLocal)}</li>
          <li>${escapeMarkup(en.hero.featModes)}</li>
          <li>${escapeMarkup(en.hero.featParams)}</li>
          <li>${escapeMarkup(en.hero.featExport)}</li>
        </ul>
        <p>${escapeMarkup(en.dropzone.hint)}</p>
        <article class="seo-shell-article">
          <p class="article-intro">${escapeMarkup(articleContent.intro)}</p>
          <section aria-labelledby="article-steps-title">
            <h2 id="article-steps-title">${escapeMarkup(articleContent.stepsTitle)}</h2>
            <ol>
${steps}
            </ol>
          </section>
          <div class="article-heading">
            <h2>${escapeMarkup(articleContent.featuresTitle)}</h2>
            <p class="article-lead">${escapeMarkup(articleContent.featuresLead)}</p>
          </div>
${sections}
          <section aria-labelledby="article-faq-title">
            <h2 id="article-faq-title">${escapeMarkup(articleContent.faqTitle)}</h2>
${faq}
          </section>
        </article>
      </main>
    </div>`;
}

function applyStaticHtml(html: string, origin = siteOrigin()): string {
  let output = html;
  output = output.replace(/\s*<!-- seo-static-head -->[\s\S]*?<!-- \/seo-static-head -->/gi, '');
  output = output.replace(/\s*<meta\s+name="description"[^>]*>/gi, '');
  output = output.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
  output = output.replace(/\s*<link\s+rel="alternate"[^>]*>/gi, '');
  output = output.replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  output = output.replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  output = output.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s*lang="[^"]*"/i, '');
    return `<html lang="en"${cleaned}>`;
  });
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeMarkup(en.meta.title)}</title>`);
  output = output.replace(
    /<\/head>/i,
    `    <!-- seo-static-head -->\n    ${buildHeadTags(origin)}\n    <!-- /seo-static-head -->\n  </head>`,
  );

  const markedShell = `<!--seo-shell-->${buildSeoShell()}<!--/seo-shell-->`;
  if (output.includes('<!--seo-shell-->')) {
    return output.replace(/<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/, markedShell);
  }
  return output.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${markedShell}</div>`);
}

function buildSitemap(origin: string, lastmod = new Date().toISOString().slice(0, 10)): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeMarkup(canonicalUrl(origin))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function buildRobots(origin: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

function buildNotFoundHtml(origin: string): string {
  const message = en.notFound;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <meta name="description" content="${escapeMarkup(message.metaDescription)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeMarkup(message.metaTitle)}</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f4f6fb;
        color: #171b26;
      }
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 32px;
        background:
          radial-gradient(800px 480px at 85% 0%, rgba(99, 102, 241, .12), transparent 60%),
          #f4f6fb;
      }
      main { max-width: 560px; text-align: center; }
      .brand { color: inherit; font-weight: 700; text-decoration: none; }
      .code {
        margin: 48px 0 8px;
        font-size: clamp(64px, 14vw, 104px);
        font-weight: 700;
        line-height: 1;
        color: #6366f1;
      }
      h1 { margin: 0 0 12px; font-size: clamp(24px, 4vw, 32px); }
      .lead { margin: 0 0 28px; color: #5f6879; line-height: 1.6; }
      .home {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        padding: 0 22px;
        border-radius: 999px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #fff;
        font-weight: 600;
        text-decoration: none;
      }
      @media (prefers-color-scheme: dark) {
        :root { background: #0d1017; color: #e8ebf2; }
        body {
          background:
            radial-gradient(800px 480px at 85% 0%, rgba(99, 102, 241, .18), transparent 60%),
            #0d1017;
        }
        .lead { color: #a6aebe; }
      }
    </style>
  </head>
  <body>
    <main>
      <a class="brand" href="${escapeMarkup(canonicalUrl(origin))}">SVGlo — ${escapeMarkup(en.header.tagline)}</a>
      <p class="code" aria-hidden="true">${escapeMarkup(message.code)}</p>
      <h1>${escapeMarkup(message.title)}</h1>
      <p class="lead">${escapeMarkup(message.lead)}</p>
      <a class="home" href="${escapeMarkup(canonicalUrl(origin))}">${escapeMarkup(message.home)}</a>
    </main>
  </body>
</html>
`;
}

function isKnownAppPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/index.html') return true;
  if (pathname === '/404' || pathname === '/404.html') return true;
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return true;
  if (pathname.startsWith('/assets/')) return true;
  if (pathname.startsWith('/@') || pathname.startsWith('/node_modules/')) return true;
  if (pathname.startsWith('/src/') || pathname.startsWith('/vendor/')) return true;
  return HAS_EXTENSION_RE.test(pathname);
}

function serveNotFound(
  req: { url?: string; method?: string },
  res: {
    statusCode: number;
    setHeader: (key: string, value: string) => void;
    end: (body: string) => void;
  },
  next: () => void,
  body: () => string,
): void {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }

  const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  if (isKnownAppPath(pathname)) {
    next();
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(body());
}

export function staticHtmlPlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'svglo-static-html',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      const notFound = buildNotFoundHtml(siteOrigin());
      server.middlewares.use((req, res, next) => {
        serveNotFound(req, res, next, () => notFound);
      });
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return applyStaticHtml(html);
      },
    },

    closeBundle() {
      const origin = siteOrigin();
      if (!fs.existsSync(outDir)) return;

      fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobots(origin), 'utf8');
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemap(origin), 'utf8');
      fs.writeFileSync(path.join(outDir, '404.html'), buildNotFoundHtml(origin), 'utf8');

      console.log(`\n  static HTML: / + 404.html   site: ${origin}\n`);
    },

    configurePreviewServer(server) {
      const file = path.join(outDir, '404.html');
      const body = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      server.middlewares.use((req, res, next) => {
        if (!body) {
          next();
          return;
        }
        serveNotFound(req, res, next, () => body);
      });
    },
  };
}
