import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = '4174';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn(npmCommand, ['run', 'preview', '--', '--port', PORT], {
  cwd: process.cwd(),
  stdio: 'ignore',
  shell: process.platform === 'win32',
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
    languageSwitch: document.querySelector('.lang-switch')?.textContent?.trim() ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  }));
  const chineseOk =
    chineseResult.documentLang === 'zh-CN'
    && chineseResult.heading?.includes('免费 SVG 转换器')
    && chineseResult.languageSwitch === 'English'
    && chineseResult.canonical?.endsWith('/zh-cn/');

  console.log(JSON.stringify({ ok: ok && chineseOk, english: result, chinese: chineseResult, consoleErrors: errors }, null, 2));

  await page.screenshot({ path: 'e2e-screenshot.png', fullPage: false });

  await browser.close();
  server.kill();
  process.exit(ok && chineseOk ? 0 : 1);
})().catch((e) => {
  console.error('TEST FAILED:', e);
  server.kill();
  process.exit(1);
});
