import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { articleContent, en, zhCN, zhCNArticleContent } from './src/i18n';
import { svgToJpgArticle } from './src/i18n/svgToJpgArticle';
import { svgToPngArticle } from './src/i18n/svgToPngArticle';

export const DEFAULT_SITE_URL = 'https://svglo.com';

const HAS_EXTENSION_RE = /\.[a-zA-Z0-9]+$/;
const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_ALT = 'SVGlo — free online SVG converter for PNG, JPG, and other images';
const SVG_TO_JPG_PATH = '/svg-to-jpg/';
const SVG_TO_JPG_TITLE = 'SVG to JPG Converter – Convert SVG to JPEG | SVGlo';
const SVG_TO_JPG_DESCRIPTION =
  "Use SVGlo's free SVG to JPG converter to set image size, quality, and background color. Convert SVG to JPEG privately in your browser with no uploads.";
const SVG_TO_PNG_PATH = '/svg-to-png/';
const SVG_TO_PNG_TITLE = 'SVG to PNG Converter – Convert SVG to PNG Online | SVGlo';
const SVG_TO_PNG_DESCRIPTION =
  'Convert SVG to PNG online for free with SVGlo. Preserve transparency, set exact dimensions, preview the result, and download a lossless PNG without uploads.';
const ZH_CN_PATH = '/zh-cn/';

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

function buildStaticToolNav(): string {
  return `<nav class="seo-shell-tools" aria-label="SVGlo image converters">
        <a href="/">Image to SVG Converter</a>
        <a href="/svg-to-jpg/">SVG to JPG Converter</a>
        <a href="/svg-to-png/">SVG to PNG Converter</a>
      </nav>`;
}

function buildSvgToJpgHeadTags(origin = siteOrigin()): string {
  const canonical = `${origin}${SVG_TO_JPG_PATH}`;
  const image = `${origin}${OG_IMAGE_PATH}`;
  const application = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'SVG to JPG Converter by SVGlo',
        url: canonical,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: SVG_TO_JPG_DESCRIPTION,
        image,
        inLanguage: 'en',
      },
      {
        '@type': 'FAQPage',
        mainEntity: svgToJpgArticle.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  const jsonLd = JSON.stringify(application).replace(/</g, '\\u003c');

  return [
    `<meta name="description" content="${escapeMarkup(SVG_TO_JPG_DESCRIPTION)}" />`,
    `<link rel="canonical" href="${escapeMarkup(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SVGlo" />`,
    `<meta property="og:title" content="${escapeMarkup(SVG_TO_JPG_TITLE)}" />`,
    `<meta property="og:description" content="${escapeMarkup(SVG_TO_JPG_DESCRIPTION)}" />`,
    `<meta property="og:url" content="${escapeMarkup(canonical)}" />`,
    `<meta property="og:image" content="${escapeMarkup(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeMarkup(SVG_TO_JPG_TITLE)}" />`,
    `<meta name="twitter:description" content="${escapeMarkup(SVG_TO_JPG_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${escapeMarkup(image)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}

function buildSvgToJpgShell(): string {
  const sections = svgToJpgArticle.sections
    .map(
      (section) =>
        `        <section aria-labelledby="svg-jpg-${section.id}">
          <h2 id="svg-jpg-${section.id}">${escapeMarkup(section.title)}</h2>
${section.paragraphs.map((paragraph) => `          <p>${escapeMarkup(paragraph)}</p>`).join('\n')}
        </section>`,
    )
    .join('\n');
  const faq = svgToJpgArticle.faq
    .map(
      (item) =>
        `        <details>
          <summary><h3>${escapeMarkup(item.q)}</h3></summary>
          <p>${escapeMarkup(item.a)}</p>
        </details>`,
    )
    .join('\n');

  return `<div class="seo-shell">
      <header class="seo-shell-header">
        <strong>SVGlo</strong>
        <span> — SVG to JPG</span>
      </header>
      ${buildStaticToolNav()}
      <main class="seo-shell-main">
        <h1>SVG to JPG Converter <span>for clear, ready-to-share images</span></h1>
        <p>${escapeMarkup(SVG_TO_JPG_DESCRIPTION)}</p>
        <ul>
          <li>Choose an SVG up to 10 MB</li>
          <li>Set an exact pixel size and background color</li>
          <li>Adjust JPG compression quality</li>
          <li>Convert and download without uploading your file</li>
        </ul>
        <article class="seo-shell-article">
          <p class="article-intro">${escapeMarkup(svgToJpgArticle.intro)}</p>
${sections}
          <section aria-labelledby="svg-jpg-faq-title">
            <h2 id="svg-jpg-faq-title">SVG to JPG converter FAQ</h2>
${faq}
          </section>
        </article>
      </main>
    </div>`;
}

function buildSvgToJpgHtml(homeHtml: string, origin = siteOrigin()): string {
  let output = homeHtml.replace(
    /<!-- seo-static-head -->[\s\S]*?<!-- \/seo-static-head -->/i,
    `<!-- seo-static-head -->\n    ${buildSvgToJpgHeadTags(origin)}\n    <!-- /seo-static-head -->`,
  );
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeMarkup(SVG_TO_JPG_TITLE)}</title>`);
  output = output.replace(
    /<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/,
    `<!--seo-shell-->${buildSvgToJpgShell()}<!--/seo-shell-->`,
  );
  return output;
}

function buildSvgToPngHeadTags(origin = siteOrigin()): string {
  const canonical = `${origin}${SVG_TO_PNG_PATH}`;
  const image = `${origin}${OG_IMAGE_PATH}`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'SVG to PNG Converter by SVGlo',
        url: canonical,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: SVG_TO_PNG_DESCRIPTION,
        image,
        inLanguage: 'en',
      },
      {
        '@type': 'FAQPage',
        mainEntity: svgToPngArticle.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  const jsonLd = JSON.stringify(graph).replace(/</g, '\\u003c');
  return [
    `<meta name="description" content="${escapeMarkup(SVG_TO_PNG_DESCRIPTION)}" />`,
    `<link rel="canonical" href="${escapeMarkup(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SVGlo" />`,
    `<meta property="og:title" content="${escapeMarkup(SVG_TO_PNG_TITLE)}" />`,
    `<meta property="og:description" content="${escapeMarkup(SVG_TO_PNG_DESCRIPTION)}" />`,
    `<meta property="og:url" content="${escapeMarkup(canonical)}" />`,
    `<meta property="og:image" content="${escapeMarkup(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeMarkup(SVG_TO_PNG_TITLE)}" />`,
    `<meta name="twitter:description" content="${escapeMarkup(SVG_TO_PNG_DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${escapeMarkup(image)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}

function buildSvgToPngShell(): string {
  const sections = svgToPngArticle.sections
    .map(
      (section) =>
        `        <section aria-labelledby="svg-png-${section.id}">
          <h2 id="svg-png-${section.id}">${escapeMarkup(section.title)}</h2>
${section.paragraphs.map((paragraph) => `          <p>${escapeMarkup(paragraph)}</p>`).join('\n')}
        </section>`,
    )
    .join('\n');
  const faq = svgToPngArticle.faq
    .map(
      (item) =>
        `        <details>
          <summary><h3>${escapeMarkup(item.q)}</h3></summary>
          <p>${escapeMarkup(item.a)}</p>
        </details>`,
    )
    .join('\n');

  return `<div class="seo-shell">
      <header class="seo-shell-header">
        <strong>SVGlo</strong>
        <span> — SVG to PNG</span>
      </header>
      ${buildStaticToolNav()}
      <main class="seo-shell-main">
        <h1>SVG to PNG Converter <span>with transparency kept intact</span></h1>
        <p>${escapeMarkup(SVG_TO_PNG_DESCRIPTION)}</p>
        <ul>
          <li>Choose an SVG up to 10 MB</li>
          <li>Set exact PNG dimensions</li>
          <li>Preserve transparency or add a background</li>
          <li>Download lossless PNG without uploading your file</li>
        </ul>
        <article class="seo-shell-article">
          <p class="article-intro">${escapeMarkup(svgToPngArticle.intro)}</p>
${sections}
          <section aria-labelledby="svg-png-faq-title">
            <h2 id="svg-png-faq-title">SVG to PNG converter FAQ</h2>
${faq}
          </section>
        </article>
      </main>
    </div>`;
}

function buildSvgToPngHtml(homeHtml: string, origin = siteOrigin()): string {
  let output = homeHtml.replace(
    /<!-- seo-static-head -->[\s\S]*?<!-- \/seo-static-head -->/i,
    `<!-- seo-static-head -->\n    ${buildSvgToPngHeadTags(origin)}\n    <!-- /seo-static-head -->`,
  );
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeMarkup(SVG_TO_PNG_TITLE)}</title>`);
  output = output.replace(
    /<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/,
    `<!--seo-shell-->${buildSvgToPngShell()}<!--/seo-shell-->`,
  );
  return output;
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
  const zhCanonical = `${origin}${ZH_CN_PATH}`;
  const image = `${origin}${OG_IMAGE_PATH}`;

  return [
    `<meta name="description" content="${escapeMarkup(en.meta.description)}" />`,
    `<link rel="canonical" href="${escapeMarkup(canonical)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeMarkup(canonical)}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${escapeMarkup(zhCanonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeMarkup(canonical)}" />`,
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

function buildZhCNHeadTags(origin = siteOrigin()): string {
  const canonical = `${origin}${ZH_CN_PATH}`;
  const englishCanonical = canonicalUrl(origin);
  const image = `${origin}${OG_IMAGE_PATH}`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'SVGlo 在线 SVG 转换器',
        url: canonical,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        browserRequirements: '需要 JavaScript 和 WebAssembly',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        description: zhCN.meta.description,
        image,
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'FAQPage',
        mainEntity: zhCNArticleContent.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  const jsonLd = JSON.stringify(graph).replace(/</g, '\\u003c');

  return [
    `<meta name="description" content="${escapeMarkup(zhCN.meta.description)}" />`,
    `<link rel="canonical" href="${escapeMarkup(canonical)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeMarkup(englishCanonical)}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${escapeMarkup(canonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeMarkup(englishCanonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SVGlo" />`,
    `<meta property="og:title" content="${escapeMarkup(zhCN.meta.title)}" />`,
    `<meta property="og:description" content="${escapeMarkup(zhCN.meta.description)}" />`,
    `<meta property="og:url" content="${escapeMarkup(canonical)}" />`,
    `<meta property="og:image" content="${escapeMarkup(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="SVGlo 免费在线 SVG 转换器" />`,
    `<meta property="og:locale" content="zh_CN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeMarkup(zhCN.meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeMarkup(zhCN.meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeMarkup(image)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
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
      ${buildStaticToolNav()}
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

function buildZhCNSeoShell(): string {
  const steps = zhCNArticleContent.steps
    .map(
      (step) =>
        `          <li>\n            <h3>${escapeMarkup(step.title)}</h3>\n            <p>${escapeMarkup(step.body)}</p>\n          </li>`,
    )
    .join('\n');
  const sections = zhCNArticleContent.sections
    .map(
      (section) =>
        `        <section class="article-copy-section" aria-labelledby="article-${section.id}">\n          <h3 id="article-${section.id}">${escapeMarkup(section.title)}</h3>\n          <div class="article-copy-body">\n${section.paragraphs
          .map((paragraph) => `            <p>${escapeMarkup(paragraph)}</p>`)
          .join('\n')}\n          </div>\n        </section>`,
    )
    .join('\n');
  const faq = zhCNArticleContent.faq
    .map(
      (item) =>
        `        <details>\n          <summary><h3>${escapeMarkup(item.q)}</h3></summary>\n          <p>${escapeMarkup(item.a)}</p>\n        </details>`,
    )
    .join('\n');

  return `<div class="seo-shell">
      <header class="seo-shell-header">
        <strong>SVGlo</strong>
        <span> — ${escapeMarkup(zhCN.header.tagline)}</span>
      </header>
      <nav class="seo-shell-tools" aria-label="SVGlo 图片转换工具">
        <a href="/zh-cn/">图片转 SVG</a>
        <a href="/svg-to-jpg/">SVG 转 JPG</a>
        <a href="/svg-to-png/">SVG 转 PNG</a>
        <a href="/" lang="en">English</a>
      </nav>
      <main class="seo-shell-main">
        <h1>${escapeMarkup(zhCN.hero.titleBefore)} <span>${escapeMarkup(zhCN.hero.titleAccent)}</span></h1>
        <p>${escapeMarkup(zhCN.hero.lead)}</p>
        <ul>
          <li>${escapeMarkup(zhCN.hero.featLocal)}</li>
          <li>${escapeMarkup(zhCN.hero.featModes)}</li>
          <li>${escapeMarkup(zhCN.hero.featParams)}</li>
          <li>${escapeMarkup(zhCN.hero.featExport)}</li>
        </ul>
        <p>${escapeMarkup(zhCN.dropzone.hint)}</p>
        <article class="seo-shell-article">
          <p class="article-intro">${escapeMarkup(zhCNArticleContent.intro)}</p>
          <section aria-labelledby="article-steps-title">
            <h2 id="article-steps-title">${escapeMarkup(zhCNArticleContent.stepsTitle)}</h2>
            <ol>
${steps}
            </ol>
          </section>
          <div class="article-heading">
            <h2>${escapeMarkup(zhCNArticleContent.featuresTitle)}</h2>
            <p class="article-lead">${escapeMarkup(zhCNArticleContent.featuresLead)}</p>
          </div>
${sections}
          <section aria-labelledby="article-faq-title">
            <h2 id="article-faq-title">${escapeMarkup(zhCNArticleContent.faqTitle)}</h2>
${faq}
          </section>
        </article>
      </main>
    </div>`;
}

function buildZhCNHtml(homeHtml: string, origin = siteOrigin()): string {
  let output = homeHtml.replace(
    /<!-- seo-static-head -->[\s\S]*?<!-- \/seo-static-head -->/i,
    `<!-- seo-static-head -->\n    ${buildZhCNHeadTags(origin)}\n    <!-- /seo-static-head -->`,
  );
  output = output.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s*lang="[^"]*"/i, '');
    return `<html lang="zh-CN"${cleaned}>`;
  });
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeMarkup(zhCN.meta.title)}</title>`);
  output = output.replace(
    /<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/,
    `<!--seo-shell-->${buildZhCNSeoShell()}<!--/seo-shell-->`,
  );
  return output;
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
  <url>
    <loc>${escapeMarkup(`${origin}${ZH_CN_PATH}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${escapeMarkup(`${origin}${SVG_TO_JPG_PATH}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${escapeMarkup(`${origin}${SVG_TO_PNG_PATH}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
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
  if (pathname === '/zh-cn' || pathname === '/zh-cn/' || pathname === '/zh-cn/index.html') return true;
  if (pathname === '/svg-to-jpg' || pathname === '/svg-to-jpg/' || pathname === '/svg-to-jpg/index.html') return true;
  if (pathname === '/svg-to-png' || pathname === '/svg-to-png/' || pathname === '/svg-to-png/index.html') return true;
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
      const homeHtmlPath = path.join(outDir, 'index.html');
      if (fs.existsSync(homeHtmlPath)) {
        const svgToJpgDir = path.join(outDir, 'svg-to-jpg');
        const svgToPngDir = path.join(outDir, 'svg-to-png');
        const zhCNDir = path.join(outDir, 'zh-cn');
        fs.mkdirSync(svgToJpgDir, { recursive: true });
        fs.mkdirSync(svgToPngDir, { recursive: true });
        fs.mkdirSync(zhCNDir, { recursive: true });
        const homeHtml = fs.readFileSync(homeHtmlPath, 'utf8');
        fs.writeFileSync(path.join(svgToJpgDir, 'index.html'), buildSvgToJpgHtml(homeHtml, origin), 'utf8');
        fs.writeFileSync(path.join(svgToPngDir, 'index.html'), buildSvgToPngHtml(homeHtml, origin), 'utf8');
        fs.writeFileSync(path.join(zhCNDir, 'index.html'), buildZhCNHtml(homeHtml, origin), 'utf8');
      }

      console.log(`\n  static HTML: / + ${ZH_CN_PATH} + ${SVG_TO_JPG_PATH} + ${SVG_TO_PNG_PATH} + 404.html   site: ${origin}\n`);
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
