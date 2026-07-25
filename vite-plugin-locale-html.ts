import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, IndexHtmlTransformContext } from 'vite';
import {
  articleContent,
  catalogs,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_HTML_LANG,
  LOCALE_PATH_SEGMENT,
  getLocaleFromPath,
  localePath,
  type Locale,
  type Messages,
} from './src/i18n/index';

/** Production origin used for canonical / hreflang / sitemap / robots. */
export const DEFAULT_SITE_URL = 'https://svglo.com';

/**
 * Resolve the public site origin.
 * - SITE_URL / VITE_SITE_URL win when set (no trailing slash)
 * - empty string → fall back to DEFAULT_SITE_URL so production SEO tags stay absolute
 * - set SITE_URL= (or relative) only if you intentionally want root-relative URLs
 */
function siteOrigin(): string {
  const raw = process.env.SITE_URL ?? process.env.VITE_SITE_URL;
  if (raw === undefined) return DEFAULT_SITE_URL;
  const trimmed = raw.replace(/\/$/, '');
  return trimmed || DEFAULT_SITE_URL;
}

function abs(origin: string, pathname: string): string {
  if (!origin) return pathname;
  // localePath('/') is `/`; avoid `https://host//`
  if (pathname === '/') return `${origin}/`;
  return `${origin}${pathname}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hreflangOf(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : locale;
}

function ogLocaleOf(locale: Locale): string {
  return locale === 'zh' ? 'zh_CN' : 'en_US';
}

function localeHref(locale: Locale, origin = ''): string {
  return abs(origin, localePath(locale));
}

/** Head tags that crawlers should see without running JS. */
export function buildHeadTags(locale: Locale, origin = siteOrigin()): string {
  const m = catalogs[locale];
  const canonical = localeHref(locale, origin);
  const alternates = [
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${hreflangOf(l)}" href="${escapeHtml(localeHref(l, origin))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(localeHref(DEFAULT_LOCALE, origin))}" />`,
  ];

  return [
    `<meta name="description" content="${escapeHtml(m.meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(m.meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(m.meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:locale" content="${ogLocaleOf(locale)}" />`,
    ...LOCALES.filter((l) => l !== locale).map(
      (l) =>
        `<meta property="og:locale:alternate" content="${ogLocaleOf(l)}" />`,
    ),
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(m.meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(m.meta.description)}" />`,
  ].join('\n    ');
}

/** Static shell inside #root — visible to no-JS crawlers, replaced when React mounts. */
export function buildSeoShell(locale: Locale, messages: Messages = catalogs[locale]): string {
  const m = messages;
  const a = articleContent[locale];
  const other = LOCALES.filter((l) => l !== locale);
  const langLinks = LOCALES.map((l) => {
    const label = l === 'zh' ? '中文' : 'English';
    const current = l === locale ? ' aria-current="page"' : '';
    return `<a href="${localePath(l)}"${current}>${label}</a>`;
  }).join(' · ');

  const steps = a.steps
    .map(
      (s) =>
        `          <li>\n            <h3>${escapeHtml(s.title)}</h3>\n            <p>${escapeHtml(s.body)}</p>\n          </li>`,
    )
    .join('\n');

  const sections = a.sections
    .map(
      (sec) =>
        `        <section class="article-copy-section" aria-labelledby="article-${sec.id}">\n          <h3 id="article-${sec.id}">${escapeHtml(sec.title)}</h3>\n          <div class="article-copy-body">\n${sec.paragraphs
          .map((p) => `            <p>${escapeHtml(p)}</p>`)
          .join('\n')}\n          </div>\n        </section>`,
    )
    .join('\n');

  const faq = a.faq
    .map(
      (f) =>
        `        <details>\n          <summary><h3>${escapeHtml(f.q)}</h3></summary>\n          <p>${escapeHtml(f.a)}</p>\n        </details>`,
    )
    .join('\n');

  return `<div class="seo-shell">
      <header class="seo-shell-header">
        <strong>SVGlo</strong>
        <span> — ${escapeHtml(m.header.tagline)}</span>
        <nav class="seo-shell-langs">${langLinks}</nav>
      </header>
      <main class="seo-shell-main">
        <h1>${escapeHtml(m.hero.titleBefore)} <span>${escapeHtml(m.hero.titleAccent)}</span></h1>
        <p>${escapeHtml(m.hero.lead)}</p>
        <ul>
          <li>${escapeHtml(m.hero.featLocal)}</li>
          <li>${escapeHtml(m.hero.featModes)}</li>
          <li>${escapeHtml(m.hero.featParams)}</li>
          <li>${escapeHtml(m.hero.featExport)}</li>
        </ul>
        <p>${escapeHtml(m.dropzone.hint)}</p>
        <article class="seo-shell-article">
          <p class="article-intro">${escapeHtml(a.intro)}</p>
          <section aria-labelledby="article-steps-title">
            <h2 id="article-steps-title">${escapeHtml(a.stepsTitle)}</h2>
            <ol>
${steps}
            </ol>
          </section>
          <div class="article-heading">
            <h2>${escapeHtml(a.featuresTitle)}</h2>
            <p class="article-lead">${escapeHtml(a.featuresLead)}</p>
          </div>
${sections}
          <section aria-labelledby="article-faq-title">
            <h2 id="article-faq-title">${escapeHtml(a.faqTitle)}</h2>
${faq}
          </section>
        </article>
        <p class="seo-shell-switch">${other
          .map((l) => {
            const label = l === 'zh' ? '中文版' : 'English version';
            return `<a href="${localePath(l)}">${escapeHtml(label)}</a>`;
          })
          .join(' · ')}</p>
      </main>
    </div>`;
}

function applyLocaleToHtml(html: string, locale: Locale, origin = siteOrigin()): string {
  const m = catalogs[locale];
  const lang = LOCALE_HTML_LANG[locale];
  const headTags = buildHeadTags(locale, origin);
  const shell = buildSeoShell(locale, m);

  let out = html;

  // Strip previous injections so this is safe to re-run (en → zh clone).
  out = out.replace(/\s*<!-- seo-locale-head -->[\s\S]*?<!-- \/seo-locale-head -->/gi, '');
  out = out.replace(/\s*<meta\s+name="description"[^>]*>/gi, '');
  out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
  out = out.replace(/\s*<link\s+rel="alternate"[^>]*>/gi, '');
  out = out.replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  out = out.replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  out = out.replace(/\s*data-locale="[^"]*"/gi, '');

  // lang + data-locale on <html>
  out = out.replace(
    /<html\b([^>]*)>/i,
    (_all, attrs: string) => {
      const cleaned = attrs.replace(/\s*lang="[^"]*"/i, '');
      return `<html lang="${lang}" data-locale="${locale}"${cleaned}>`;
    },
  );

  // title
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(m.meta.title)}</title>`);

  // Inject head tags before </head>
  out = out.replace(
    /<\/head>/i,
    `    <!-- seo-locale-head -->\n    ${headTags}\n    <!-- /seo-locale-head -->\n  </head>`,
  );

  // Fill #root with SEO shell. Markers keep re-application safe despite nested divs.
  const markedShell = `<!--seo-shell-->${shell}<!--/seo-shell-->`;
  if (out.includes('<!--seo-shell-->')) {
    out = out.replace(/<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/, markedShell);
  } else {
    out = out.replace(
      /<div id="root">\s*<\/div>/i,
      `<div id="root">${markedShell}</div>`,
    );
  }

  return out;
}

function buildSitemap(origin: string, lastmod = new Date().toISOString().slice(0, 10)): string {
  const base = origin || DEFAULT_SITE_URL;
  const href = (locale: Locale) => abs(base.replace(/\/$/, ''), localePath(locale));
  // Homepage-style landing pages: index both locales; default language slightly higher priority.
  const priorityOf = (locale: Locale) => (locale === DEFAULT_LOCALE ? '1.0' : '0.9');

  const urls = LOCALES.map((l) => {
    const loc = escapeXml(href(l));
    const alt = LOCALES.map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflangOf(a)}" href="${escapeXml(href(a))}"/>`,
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(href(DEFAULT_LOCALE))}"/>`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priorityOf(l)}</priority>
${alt}
${xDefault}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function buildRobots(origin: string): string {
  const base = (origin || DEFAULT_SITE_URL).replace(/\/$/, '');
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function localeFromReqUrl(url: string | undefined): Locale {
  if (!url) return DEFAULT_LOCALE;
  const pathname = url.split('?')[0] ?? '';
  return getLocaleFromPath(pathname);
}

/**
 * Emits per-locale static HTML (meta + SEO shell) for crawlers, while the
 * app remains a client-side SPA. Dev middleware serves the same shape.
 *
 * URL layout:
 *   `/`        → English (default, unprefixed)
 *   `/zh-cn/`  → Chinese
 */
export function localeHtmlPlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'svglo-locale-html',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? '/';
        const pathname = raw.split('?')[0] ?? '/';
        const qs = raw.includes('?') ? '?' + raw.split('?')[1] : '';

        // Normalize /zh-cn → /zh-cn/
        if (pathname === '/zh-cn') {
          res.statusCode = 302;
          res.setHeader('Location', `/zh-cn/${qs}`);
          res.end();
          return;
        }

        next();
      });
    },

    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx: IndexHtmlTransformContext) {
        // During build, ctx.path is the entry html path; during dev it's the request.
        const locale = localeFromReqUrl(ctx.originalUrl ?? ctx.path);
        if (ctx.server) {
          // Dev: `/` is English; `/zh-cn/` is Chinese.
          return applyLocaleToHtml(html, locale);
        }
        // Build: leave a default-en shell; closeBundle clones non-default locales.
        return applyLocaleToHtml(html, DEFAULT_LOCALE);
      },
    },

    closeBundle() {
      const origin = siteOrigin();
      const builtIndex = path.join(outDir, 'index.html');
      if (!fs.existsSync(builtIndex)) return;

      const baseHtml = fs.readFileSync(builtIndex, 'utf8');

      // Root = English (default locale, unprefixed)
      fs.writeFileSync(
        builtIndex,
        applyLocaleToHtml(baseHtml, DEFAULT_LOCALE, origin),
        'utf8',
      );

      // Non-default locales under their path segment (e.g. /zh-cn/)
      for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;
        const segment = LOCALE_PATH_SEGMENT[locale];
        if (!segment) continue;
        const dir = path.join(outDir, segment);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'index.html'),
          applyLocaleToHtml(baseHtml, locale, origin),
          'utf8',
        );
      }

      // robots.txt + sitemap.xml (absolute URLs via DEFAULT_SITE_URL / SITE_URL)
      fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobots(origin), 'utf8');
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemap(origin), 'utf8');

      console.log(`\n  locale HTML: / (en) /zh-cn/   site: ${origin}\n`);
    },
  };
}
