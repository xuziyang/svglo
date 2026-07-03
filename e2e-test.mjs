import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const path = require('node:path');

const SAMPLE = path.resolve('../vtracer/docs/assets/samples/angel-luciano-LATYeZyw88c-unsplash-s.jpg');
const PORT = '4174';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('npm', ['run', 'preview', '--', '--port', PORT], {
  cwd: process.cwd(),
  shell: true,
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

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  // Upload the sample image through the hidden file input.
  await page.setInputFiles('input[type="file"]', SAMPLE);

  // Wait for the Download button to become enabled (= svgString is set).
  await page.waitForSelector('button.btn-primary:not([disabled])', { timeout: 45000 });

  const result = await page.evaluate(() => {
    const svg = document.getElementById('vt-svg');
    return {
      pathCount: svg ? svg.querySelectorAll('path').length : 0,
      hasViewBox: svg ? svg.getAttribute('viewBox') : null,
      outerSnippet: svg ? svg.outerHTML.slice(0, 240) : null,
      meta: document.querySelector('.preview-meta')?.textContent?.trim() ?? null,
    };
  });

  console.log(JSON.stringify({ ok: result.pathCount > 0, ...result, consoleErrors: errors }, null, 2));

  await page.screenshot({ path: 'e2e-screenshot.png', fullPage: false });

  await browser.close();
  server.kill();
  process.exit(result.pathCount > 0 ? 0 : 1);
})().catch((e) => {
  console.error('TEST FAILED:', e);
  server.kill();
  process.exit(1);
});
