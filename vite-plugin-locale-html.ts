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

/** True when the path looks like a static asset (has any file extension). */
const HAS_EXTENSION_RE = /\.[a-zA-Z0-9]+$/;

/**
 * Resolve the public site origin (cached for the build / dev session).
 * - SITE_URL / VITE_SITE_URL win when set (no trailing slash)
 * - empty string → fall back to DEFAULT_SITE_URL so production SEO tags stay absolute
 * - set SITE_URL= (or relative) only if you intentionally want root-relative URLs
 */
function makeSiteOrigin() {
  return (): string => {
    const raw = process.env.SITE_URL ?? process.env.VITE_SITE_URL;
    if (raw === undefined) return DEFAULT_SITE_URL;
    const trimmed = raw.trim().replace(/\/+$/, '');
    return trimmed || DEFAULT_SITE_URL;
  };
}

const getSiteOrigin = makeSiteOrigin();

/** Strip trailing slash from any origin or fall back to DEFAULT_SITE_URL. */
function normalizedOrigin(origin: string | null | undefined): string {
  const base = origin || DEFAULT_SITE_URL;
  return base.replace(/\/+$/, '') || DEFAULT_SITE_URL;
}

function abs(origin: string, pathname: string): string {
  if (!origin) return pathname;
  // localePath('/') is `/`; avoid `https://host//`
  if (pathname === '/') return `${origin}/`;
  return `${origin}${pathname}`;
}

/** Escape &, <, >, " — safe for HTML attributes and XML text. */
function escapeMarkup(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Back-compat alias used in HTML-attribute interpolation paths.
const escapeHtml = escapeMarkup;

function hreflangOf(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : locale;
}

function ogLocaleOf(locale: Locale): string {
  return locale === 'zh' ? 'zh_CN' : 'en_US';
}

function localeHref(locale: Locale, origin = ''): string {
  return abs(origin, localePath(locale));
}

const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_ALT: Record<Locale, string> = {
  en: 'SVGlo — free online SVG converter for PNG, JPG, and other images',
  zh: 'SVGlo — 免费在线 SVG 转换器，支持 PNG、JPG 等图片',
};

/** JSON-LD for WebApplication + FAQPage (crawlers read this without JS). */
export function buildJsonLd(locale: Locale, origin = getSiteOrigin()): string {
  const m = catalogs[locale];
  const a = articleContent[locale];
  const canonical = localeHref(locale, origin);
  const image = abs(origin, OG_IMAGE_PATH);

  const webApp = {
    '@type': 'WebApplication',
    name: 'SVGlo',
    url: canonical,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and WebAssembly',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: m.meta.description,
    image,
    inLanguage: LOCALE_HTML_LANG[locale],
  };

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: a.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [webApp, faqPage],
  };

  // Escape </script> so FAQ copy cannot break out of the script tag.
  const json = JSON.stringify(graph).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/** Head tags that crawlers should see without running JS. */
export function buildHeadTags(locale: Locale, origin = getSiteOrigin()): string {
  const m = catalogs[locale];
  const canonical = localeHref(locale, origin);
  const ogImage = abs(origin, OG_IMAGE_PATH);
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
    `<meta property="og:site_name" content="SVGlo" />`,
    `<meta property="og:title" content="${escapeHtml(m.meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(m.meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(OG_IMAGE_ALT[locale])}" />`,
    `<meta property="og:locale" content="${ogLocaleOf(locale)}" />`,
    ...LOCALES.filter((l) => l !== locale).map(
      (l) =>
        `<meta property="og:locale:alternate" content="${ogLocaleOf(l)}" />`,
    ),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(m.meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(m.meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    buildJsonLd(locale, origin),
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

function applyLocaleToHtml(html: string, locale: Locale, origin = getSiteOrigin()): string {
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
  out = out.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
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
  const base = normalizedOrigin(origin);
  const href = (locale: Locale) => abs(base, localePath(locale));
  // Homepage-style landing pages: index both locales; default language slightly higher priority.
  const priorityOf = (locale: Locale) => (locale === DEFAULT_LOCALE ? '1.0' : '0.9');

  const urls = LOCALES.map((l) => {
    const loc = escapeMarkup(href(l));
    const alt = LOCALES.map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflangOf(a)}" href="${escapeMarkup(href(a))}"/>`,
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeMarkup(href(DEFAULT_LOCALE))}"/>`;
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
  const base = normalizedOrigin(origin);
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

/**
 * Standalone 404 page for static hosts (Cloudflare Pages / Netlify serve
 * `/404.html` with HTTP 404 for unknown paths). Self-contained — no app JS —
 * with bilingual copy and a tiny script that picks the UI language from the
 * request path / browser preference.
 */
function buildNotFoundHtml(origin: string): string {
  const base = normalizedOrigin(origin);
  const homeByLocale = Object.fromEntries(
    LOCALES.map((l) => [l, abs(base, localePath(l))] as const),
  ) as Record<Locale, string>;
  const en = catalogs.en.notFound;
  const zh = catalogs.zh.notFound;

  // Inline script: prefer path prefix (/zh-cn/...), then navigator.language.
  // Keeps the page useful without shipping the full React bundle on 404s.
  const bootScript = `(function(){
  var path = location.pathname || '/';
  var preferZh = /^\\/zh-cn(\\/|$)/i.test(path)
    || ((navigator.language || '').toLowerCase().indexOf('zh') === 0);
  var root = document.documentElement;
  var en = document.getElementById('nf-en');
  var zh = document.getElementById('nf-zh');
  if (!en || !zh) return;
  if (preferZh) {
    root.lang = 'zh-CN';
    en.hidden = true;
    zh.hidden = false;
    document.title = ${JSON.stringify(zh.metaTitle)};
  } else {
    root.lang = 'en';
    en.hidden = false;
    zh.hidden = true;
    document.title = ${JSON.stringify(en.metaTitle)};
  }
})();`;

  const panel = (locale: Locale, hidden: boolean) => {
    const m = catalogs[locale].notFound;
    const otherLocale: Locale = locale === 'zh' ? 'en' : 'zh';
    const tagline = escapeHtml(catalogs[locale].header.tagline);
    return `<section id="nf-${locale}" class="nf-panel"${hidden ? ' hidden' : ''}>
      <header class="nf-header">
        <a class="brand" href="${escapeHtml(homeByLocale[locale])}">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <defs>
                <linearGradient id="nf-mark-bg-${locale}" x1="4" y1="2" x2="28" y2="30">
                  <stop stop-color="#4f46e5" />
                  <stop offset="0.55" stop-color="#6366f1" />
                  <stop offset="1" stop-color="#8b5cf6" />
                </linearGradient>
                <linearGradient id="nf-mark-path-${locale}" x1="10" y1="8" x2="24" y2="24">
                  <stop stop-color="#e0e7ff" />
                  <stop offset="0.5" stop-color="#ffffff" />
                  <stop offset="1" stop-color="#fde68a" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#nf-mark-bg-${locale})" />
              <rect x="1.2" y="1.2" width="29.6" height="14" rx="8" fill="#ffffff" opacity="0.08" />
              <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="#c7d2fe" />
              <rect x="11.5" y="6.5" width="4" height="4" rx="1" fill="#a5b4fc" opacity="0.95" />
              <rect x="6.5" y="11.5" width="4" height="4" rx="1" fill="#e0e7ff" opacity="0.85" />
              <path d="M22.8 9.2 C18.6 7.8 14.8 9.6 14.8 12.4 C14.8 15.8 22.4 15.2 22.4 19.4 C22.4 22.8 18.2 24.6 12.4 22.6" fill="none" stroke="url(#nf-mark-path-${locale})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="14.8" cy="12.4" r="1.35" fill="#ffffff" />
              <circle cx="22.4" cy="19.4" r="1.35" fill="#ffffff" />
              <circle cx="12.4" cy="22.6" r="1.45" fill="#fbbf24" />
            </svg>
          </span>
          <span class="brand-text">
            <strong>SVGlo</strong>
            <small>${tagline}</small>
          </span>
        </a>
        <nav class="nf-lang" aria-label="${escapeHtml(m.langSwitch)}">
          <a href="${escapeHtml(homeByLocale[otherLocale])}" class="link-btn">${escapeHtml(m.langOther)}</a>
        </nav>
      </header>
      <main class="nf-main">
        <p class="nf-code" aria-hidden="true">${escapeHtml(m.code)}</p>
        <h1>${escapeHtml(m.title)}</h1>
        <p class="nf-lead">${escapeHtml(m.lead)}</p>
        <p class="nf-actions">
          <a class="nf-home" href="${escapeHtml(homeByLocale[locale])}">${escapeHtml(m.home)}</a>
        </p>
      </main>
    </section>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <meta name="description" content="${escapeHtml(en.metaDescription)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeHtml(en.metaTitle)}</title>
    <style>
      :root {
        --bg: #f4f6fb;
        --bg-grad:
          radial-gradient(1000px 500px at 85% -10%, rgba(99, 102, 241, 0.10), transparent 60%),
          radial-gradient(800px 480px at -10% 0%, rgba(139, 92, 246, 0.08), transparent 55%);
        --surface: #ffffff;
        --surface-2: #f8fafc;
        --border: #e7eaf1;
        --text: #171b26;
        --text-muted: #5f6879;
        --text-faint: #98a0b0;
        --accent: #6366f1;
        --accent-strong: #4f46e5;
        --accent-grad: linear-gradient(135deg, #6366f1, #8b5cf6);
        --radius: 14px;
        --radius-sm: 9px;
        --shadow-md: 0 6px 20px rgba(16, 24, 40, 0.08);
        --ring: 0 0 0 3px rgba(99, 102, 241, 0.28);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
          'Microsoft YaHei', Roboto, Helvetica, Arial, sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0d1017;
          --bg-grad:
            radial-gradient(1000px 500px at 85% -10%, rgba(99, 102, 241, 0.16), transparent 60%),
            radial-gradient(800px 480px at -10% 0%, rgba(139, 92, 246, 0.12), transparent 55%);
          --surface: #161a23;
          --surface-2: #1c2130;
          --border: #262c3a;
          --text: #e8ebf2;
          --text-muted: #a6aebe;
          --text-faint: #6b7488;
          --accent: #818cf8;
          --accent-strong: #a5b4fc;
          --shadow-md: 0 6px 20px rgba(0, 0, 0, 0.4);
          --ring: 0 0 0 3px rgba(129, 140, 248, 0.35);
        }
      }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      html, body { height: 100%; }
      body {
        margin: 0;
        background: var(--bg);
        background-image: var(--bg-grad);
        background-attachment: fixed;
        color: var(--text);
        -webkit-font-smoothing: antialiased;
      }
      a { color: var(--accent); text-decoration: none; }
      a:hover { text-decoration: underline; }
      a:focus-visible {
        outline: none;
        box-shadow: var(--ring);
        border-radius: var(--radius-sm);
      }
      .nf-panel {
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }
      .nf-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
        padding: 20px 28px 0;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 11px;
        color: var(--text);
        text-decoration: none;
      }
      .brand:hover { text-decoration: none; }
      .brand-mark { display: flex; }
      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }
      .brand-text strong {
        font-size: 17px;
        letter-spacing: -0.01em;
      }
      .brand-text small {
        font-size: 11px;
        color: var(--text-muted);
      }
      .nf-lang .link-btn {
        appearance: none;
        display: inline-block;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        font-size: 14px;
        padding: 8px 13px;
        border-radius: var(--radius-sm);
        text-decoration: none;
        transition: background 0.14s, color 0.14s, border-color 0.14s;
      }
      .nf-lang .link-btn:hover {
        background: var(--surface-2);
        color: var(--text);
        text-decoration: none;
      }
      .nf-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 48px 28px 72px;
        max-width: 560px;
        margin: 0 auto;
      }
      .nf-code {
        margin: 0 0 8px;
        font-size: clamp(64px, 14vw, 104px);
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
        background: var(--accent-grad);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .nf-main h1 {
        margin: 0 0 12px;
        font-size: clamp(24px, 4vw, 32px);
        letter-spacing: -0.02em;
      }
      .nf-lead {
        margin: 0 0 28px;
        font-size: 16px;
        line-height: 1.6;
        color: var(--text-muted);
      }
      .nf-actions { margin: 0; }
      .nf-home {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 22px;
        border-radius: 999px;
        background: var(--accent-grad);
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        box-shadow: var(--shadow-md);
        transition: transform 0.14s ease, filter 0.14s ease;
      }
      .nf-home:hover {
        text-decoration: none;
        filter: brightness(1.05);
        transform: translateY(-1px);
      }
      .nf-home:focus-visible {
        outline: none;
        box-shadow: var(--shadow-md), var(--ring);
      }
      @media (prefers-reduced-motion: reduce) {
        .nf-home { transition: none; }
        .nf-home:hover { transform: none; }
      }
    </style>
  </head>
  <body>
    ${LOCALES.map((l) => panel(l, l !== DEFAULT_LOCALE)).join('\n    ')}
    <script>${bootScript}</script>
  </body>
</html>
`;
}

// Memoize the 404 page per origin — origin is stable for the dev/preview
// session, so the ~11KB of HTML/CSS/JSON work happens at most once per session.
const notFoundMemo = new Map<string, string>();
function buildNotFoundHtmlCached(origin: string): string {
  const key = normalizedOrigin(origin);
  const cached = notFoundMemo.get(key);
  if (cached) return cached;
  const html = buildNotFoundHtml(key);
  notFoundMemo.set(key, html);
  return html;
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
      // Run before Vite's SPA HTML fallback so unknown paths are real 404s
      // instead of index.html with status 200.
      server.middlewares.use((req, res, next) => {
        const [rawPathname = '/', rawQuery = ''] = (req.url ?? '/').split('?');
        const qs = rawQuery ? `?${rawQuery}` : '';

        // Normalize /zh-cn → /zh-cn/
        if (rawPathname === '/zh-cn') {
          res.statusCode = 302;
          res.setHeader('Location', `/zh-cn/${qs}`);
          res.end();
          return;
        }

        serveDevNotFound(req, res, next, () => buildNotFoundHtmlCached(getSiteOrigin()));
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
      const origin = getSiteOrigin();
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

      // Static 404 for Cloudflare Pages / Netlify / most static hosts.
      fs.writeFileSync(path.join(outDir, '404.html'), buildNotFoundHtmlCached(origin), 'utf8');

      console.log(`\n  locale HTML: / (en) /zh-cn/ + 404.html   site: ${origin}\n`);
    },

    configurePreviewServer(server) {
      // Same as dev: intercept before SPA fallback so preview matches CF Pages.
      // Cache the 404 file body — the file is static for the preview's lifetime.
      const file = path.join(outDir, '404.html');
      const exists = fs.existsSync(file);
      let body = '';
      if (exists) body = fs.readFileSync(file, 'utf8');
      server.middlewares.use((req, res, next) => {
        if (!exists) {
          next();
          return;
        }
        serveDevNotFound(req, res, next, () => body);
      });
    },
  };
}

/** Paths the app intentionally serves (everything else is a 404 document). */
function isKnownAppPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/index.html') return true;
  if (pathname === '/zh-cn' || pathname === '/zh-cn/' || pathname === '/zh-cn/index.html') {
    return true;
  }
  if (pathname === '/404' || pathname === '/404.html') return true;
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return true;
  // Static assets / source modules (have an extension, or Vite internals)
  if (pathname.startsWith('/assets/')) return true;
  if (pathname.startsWith('/@') || pathname.startsWith('/node_modules/')) return true;
  if (pathname.startsWith('/src/') || pathname.startsWith('/vendor/')) return true;
  if (HAS_EXTENSION_RE.test(pathname)) return true;
  return false;
}

function serveDevNotFound(
  req: { url?: string; method?: string },
  res: {
    statusCode: number;
    setHeader: (k: string, v: string) => void;
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
