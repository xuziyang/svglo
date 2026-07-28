import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PORT = '4174';
const viteCli = fileURLToPath(new URL('./node_modules/vite/bin/vite.js', import.meta.url));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn(process.execPath, [viteCli, 'preview', '--port', PORT, '--strictPort'], {
  cwd: process.cwd(),
  stdio: 'ignore',
});

(async () => {
  // wait for server
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) break;
    } catch {}
    await sleep(300);
  }

  const chineseLocaleResponse = await fetch(`http://localhost:${PORT}/zh-cn/`);
  if (!chineseLocaleResponse.ok) {
    throw new Error(`Expected /zh-cn/ to load, got ${chineseLocaleResponse.status}`);
  }
  for (const route of ['/zh-cn/svg-to-jpg/', '/zh-cn/svg-to-png/']) {
    const response = await fetch(`http://localhost:${PORT}${route}`);
    if (!response.ok) throw new Error(`Expected ${route} to load, got ${response.status}`);
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  // Use the built-in raster fixture so the smoke test is self-contained.
  await page.click('.dropzone-example button');

  // Wait for the Download button to become enabled (= svgString is set).
  await page.waitForSelector('button.btn-primary:not([disabled])', { timeout: 45000 });

  const result = await page.evaluate(() => {
    const svg = document.getElementById('vt-svg');
    return {
      pathCount: svg ? svg.querySelectorAll('path').length : 0,
      hasViewBox: svg ? svg.getAttribute('viewBox') : null,
      outerSnippet: svg ? svg.outerHTML.slice(0, 240) : null,
      meta: document.querySelector('.preview-meta')?.textContent?.trim() ?? null,
      documentLang: document.documentElement.lang,
      hasLanguageSwitch: document.querySelector('.lang-switch') !== null,
    };
  });

  const ok =
    result.pathCount > 0
    && result.documentLang === 'en'
    && result.hasLanguageSwitch
    && errors.length === 0;

  await page.goto(`http://localhost:${PORT}/zh-cn/`, { waitUntil: 'domcontentloaded' });
  const chineseResult = await page.evaluate(() => ({
    documentLang: document.documentElement.lang,
    title: document.title,
    heading: document.querySelector('h1')?.textContent?.trim() ?? null,
    currentLanguage: document.querySelector('.lang-switch > span')?.textContent?.trim() ?? null,
    languageLinks: [...document.querySelectorAll('.language-menu-popover a')].map((link) => ({
      label: link.textContent?.replace('✓', '').trim() ?? '',
      href: link.getAttribute('href'),
    })),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  }));
  const chineseOk =
    chineseResult.documentLang === 'zh-CN'
    && chineseResult.heading?.includes('免费 SVG 转换器')
    && chineseResult.currentLanguage === '简体中文'
    && chineseResult.languageLinks.some((link) => link.label === 'English' && link.href === '/')
    && chineseResult.canonical?.endsWith('/zh-cn/');

  const chineseTools = [];
  for (const tool of ['svg-to-jpg', 'svg-to-png']) {
    await page.goto(`http://localhost:${PORT}/zh-cn/${tool}/`, { waitUntil: 'domcontentloaded' });
    chineseTools.push(await page.evaluate(() => ({
      documentLang: document.documentElement.lang,
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.trim() ?? null,
      currentLanguage: document.querySelector('.lang-switch > span')?.textContent?.trim() ?? null,
      englishHref: [...document.querySelectorAll('.language-menu-popover a')]
        .find((link) => link.getAttribute('lang') === 'en')
        ?.getAttribute('href') ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    })));
  }
  const chineseToolsOk =
    chineseTools[0]?.documentLang === 'zh-CN'
    && chineseTools[0]?.heading?.includes('SVG 转 JPG 转换器')
    && chineseTools[0]?.currentLanguage === '简体中文'
    && chineseTools[0]?.englishHref === '/svg-to-jpg/'
    && chineseTools[0]?.canonical?.endsWith('/zh-cn/svg-to-jpg/')
    && chineseTools[1]?.documentLang === 'zh-CN'
    && chineseTools[1]?.heading?.includes('SVG 转 PNG 转换器')
    && chineseTools[1]?.currentLanguage === '简体中文'
    && chineseTools[1]?.englishHref === '/svg-to-png/'
    && chineseTools[1]?.canonical?.endsWith('/zh-cn/svg-to-png/');

  console.log(JSON.stringify({
    ok: ok && chineseOk && chineseToolsOk,
    english: result,
    chinese: chineseResult,
    chineseTools,
    consoleErrors: errors,
  }, null, 2));

  await page.screenshot({ path: 'e2e-screenshot.png', fullPage: false });

  await browser.close();
  server.kill();
  process.exit(ok && chineseOk && chineseToolsOk ? 0 : 1);
})().catch((e) => {
  console.error('TEST FAILED:', e);
  server.kill();
  process.exit(1);
});
