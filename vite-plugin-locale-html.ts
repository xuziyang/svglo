import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, IndexHtmlTransformContext } from 'vite';
import {
  catalogs,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_HTML_LANG,
  type Locale,
  type Messages,
} from './src/i18n/index';

function siteOrigin(): string {
  return (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
}

function abs(origin: string, pathname: string): string {
  return origin ? `${origin}${pathname}` : pathname;
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

/** Head tags that crawlers should see without running JS. */
export function buildHeadTags(locale: Locale, origin = siteOrigin()): string {
  const m = catalogs[locale];
  const canonicalPath = `/${locale}/`;
  const canonical = abs(origin, canonicalPath);
  const alternates = [
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${hreflangOf(l)}" href="${escapeHtml(abs(origin, `/${l}/`))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(abs(origin, `/${DEFAULT_LOCALE}/`))}" />`,
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
  const other = LOCALES.filter((l) => l !== locale);
  const langLinks = LOCALES.map((l) => {
    const label = l === 'zh' ? '中文' : 'English';
    const current = l === locale ? ' aria-current="page"' : '';
    return `<a href="/${l}/"${current}>${label}</a>`;
  }).join(' · ');

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
        <p class="seo-shell-switch">${other
          .map((l) => {
            const label = l === 'zh' ? '中文版' : 'English version';
            return `<a href="/${l}/">${escapeHtml(label)}</a>`;
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

function buildRootRedirectHtml(origin = siteOrigin()): string {
  const en = abs(origin, '/en/');
  const zh = abs(origin, '/zh/');
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(en)}" />
    <link rel="alternate" hreflang="zh-CN" href="${escapeHtml(zh)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(en)}" />
    <title>SVGlo</title>
    <script>
      (function () {
        var langs = navigator.languages && navigator.languages.length
          ? navigator.languages
          : [navigator.language];
        var zh = false;
        for (var i = 0; i < langs.length; i++) {
          if (langs[i] && String(langs[i]).toLowerCase().indexOf('zh') === 0) {
            zh = true;
            break;
          }
        }
        location.replace(zh ? '/zh/' : '/en/');
      })();
    </script>
    <meta http-equiv="refresh" content="0;url=/en/" />
  </head>
  <body>
    <p>
      <a href="/en/">English</a> · <a href="/zh/">中文</a>
    </p>
  </body>
</html>
`;
}

function buildSitemap(origin: string): string {
  const base = origin || 'https://example.com';
  const urls = LOCALES.map((l) => {
    const loc = `${base.replace(/\/$/, '')}/${l}/`;
    const alt = LOCALES.map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflangOf(a)}" href="${base.replace(/\/$/, '')}/${a}/"/>`,
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${base.replace(/\/$/, '')}/${DEFAULT_LOCALE}/"/>`;
    return `  <url>
    <loc>${loc}</loc>
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

function localeFromReqUrl(url: string | undefined): Locale | null {
  if (!url) return null;
  const pathname = url.split('?')[0] ?? '';
  const m = pathname.match(/^\/(en|zh)(?:\/|$)/);
  return m ? (m[1] as Locale) : null;
}

/**
 * Emits per-locale static HTML (meta + SEO shell) for crawlers, while the
 * app remains a client-side SPA. Dev middleware serves the same shape.
 */
export function localeHtmlPlugin(): Plugin {
  let outDir = 'dist';
  let root = process.cwd();

  return {
    name: 'svglo-locale-html',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      root = config.root;
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? '/';
        const pathname = raw.split('?')[0] ?? '/';

        // Normalize /en → /en/, /zh → /zh/
        if (pathname === '/en' || pathname === '/zh') {
          res.statusCode = 302;
          res.setHeader('Location', `${pathname}/${raw.includes('?') ? '?' + raw.split('?')[1] : ''}`);
          res.end();
          return;
        }

        // Root: tiny language picker (mirrors production)
        if (pathname === '/' || pathname === '/index.html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(buildRootRedirectHtml(siteOrigin()));
          return;
        }

        next();
      });
    },

    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx: IndexHtmlTransformContext) {
        // During build, ctx.path is the entry html path; during dev it's the request.
        const fromReq = localeFromReqUrl(ctx.originalUrl ?? ctx.path);
        const locale = fromReq ?? DEFAULT_LOCALE;
        // Skip transforming into a locale page when building the root entry —
        // writeBundle will emit en/zh and replace root. Still tag default for safety.
        if (ctx.server) {
          // Dev: only locale paths reach the SPA index (root handled in middleware).
          return applyLocaleToHtml(html, locale);
        }
        // Build: leave a default-en shell; writeBundle clones per locale.
        return applyLocaleToHtml(html, DEFAULT_LOCALE);
      },
    },

    closeBundle() {
      const origin = siteOrigin();
      const builtIndex = path.join(outDir, 'index.html');
      if (!fs.existsSync(builtIndex)) return;

      const baseHtml = fs.readFileSync(builtIndex, 'utf8');

      for (const locale of LOCALES) {
        const dir = path.join(outDir, locale);
        fs.mkdirSync(dir, { recursive: true });
        const html = applyLocaleToHtml(baseHtml, locale, origin);
        // baseHtml may already be en-transformed; applyLocaleToHtml is idempotent enough
        // if we start from a clean asset-linked HTML. Re-read pristine by stripping prior SEO.
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
      }

      // Root becomes language redirect (noindex)
      fs.writeFileSync(path.join(outDir, 'index.html'), buildRootRedirectHtml(origin), 'utf8');

      // robots.txt
      const sitemapHref = origin ? `${origin}/sitemap.xml` : '/sitemap.xml';
      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /index.html\n\nSitemap: ${sitemapHref}\n`,
        'utf8',
      );

      // sitemap.xml (absolute URLs when SITE_URL is set)
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemap(origin), 'utf8');

      // Helpful build log
      const where = origin || '(relative; set SITE_URL for absolute canonical/sitemap)';
      console.log(`\n  locale HTML: /en/ /zh/   site: ${where}\n`);
    },
  };
}
