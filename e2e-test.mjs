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
    if (msg.type() === 'error') {
      const location = msg.location();
      // Analytics requests may be blocked in CI; they do not affect app behavior.
      if (/^https:\/\/(?:stats\.g\.doubleclick\.net|www\.google-analytics\.com|www\.googletagmanager\.com)\//.test(location.url)) {
        return;
      }
      errors.push(location.url ? `${msg.text()} (${location.url})` : msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  // Use the built-in raster fixture so the smoke test is self-contained.
  await page.click('.dropzone-example button');

  // Wait for the Download button to become enabled (= svgString is set).
  await page.waitForSelector('button.btn-primary:not([disabled])', { timeout: 45000 });

  const initialControls = await page.evaluate(() => ({
    advancedExpanded: document.querySelector('.advanced-toggle')?.getAttribute('aria-expanded'),
    hasAdvancedContent: document.querySelector('.advanced-content') !== null,
    selectedPreset: document.querySelector('.preset-btn[aria-pressed="true"]')?.textContent?.trim(),
    presetDescription: document.querySelector('.preset-description')?.textContent?.trim(),
  }));

  // Advanced settings start collapsed and can be opened from the keyboard.
  await page.locator('.advanced-toggle').focus();
  await page.keyboard.press('Enter');
  const openedControls = await page.evaluate(() => ({
    advancedExpanded: document.querySelector('.advanced-toggle')?.getAttribute('aria-expanded'),
    hasAdvancedContent: document.querySelector('.advanced-content') !== null,
  }));

  // Existing conditional controls remain intact for binary and pixel presets.
  await page.getByRole('button', { name: 'B&W Line Art', exact: true }).click();
  const binaryLabels = await page.locator('.advanced-content .field-label').allTextContents();
  await page.getByRole('button', { name: 'Pixel Art', exact: true }).click();
  const pixelLabels = await page.locator('.advanced-content .field-label').allTextContents();

  // A manual adjustment keeps the last preset selected and can be fully reset.
  await page.getByRole('button', { name: 'Photo', exact: true }).click();
  const speckleSlider = page.locator('input.slider').first();
  const photoSpeckle = await speckleSlider.inputValue();
  await speckleSlider.fill('9');
  const adjustedControls = await page.evaluate(() => ({
    hasAdjustedBadge: document.querySelector('.preset-adjusted') !== null,
    hasResetButton: document.querySelector('.preset-reset') !== null,
    selectedPreset: document.querySelector('.preset-btn[aria-pressed="true"]')?.textContent?.trim(),
  }));
  await page.locator('.preset-reset').click();
  const resetControls = await page.evaluate(() => ({
    hasAdjustedBadge: document.querySelector('.preset-adjusted') !== null,
    speckle: document.querySelector('input.slider')?.value,
    selectedPreset: document.querySelector('.preset-btn[aria-pressed="true"]')?.textContent?.trim(),
  }));

  // Collapsing only hides the controls; reopening shows the restored photo config.
  await page.locator('.advanced-toggle').focus();
  await page.keyboard.press('Space');
  const collapsedAgain = await page.evaluate(() => ({
    advancedExpanded: document.querySelector('.advanced-toggle')?.getAttribute('aria-expanded'),
    hasAdvancedContent: document.querySelector('.advanced-content') !== null,
  }));
  await page.locator('.advanced-toggle').focus();
  await page.keyboard.press('Enter');
  const reopenedSpeckle = await speckleSlider.inputValue();

  // Let the final debounced conversion finish before inspecting the SVG.
  // Re-converts use a non-blocking progress strip (not the full-screen overlay).
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () => !document.querySelector('.preview-overlay') && !document.querySelector('.preview-progress-inline'),
    null,
    { timeout: 45000 },
  );

  const controlsOk =
    initialControls.advancedExpanded === 'false'
    && !initialControls.hasAdvancedContent
    && initialControls.selectedPreset === 'Recommended'
    && initialControls.presetDescription?.includes('Good for most icons and illustrations')
    && openedControls.advancedExpanded === 'true'
    && openedControls.hasAdvancedContent
    && binaryLabels.includes('Filter speckle')
    && binaryLabels.includes('Mode')
    && binaryLabels.includes('Path precision')
    && !binaryLabels.includes('Hierarchy')
    && !binaryLabels.includes('Color precision')
    && pixelLabels.includes('Filter speckle')
    && pixelLabels.includes('Mode')
    && pixelLabels.includes('Path precision')
    && !pixelLabels.includes('Corner threshold')
    && adjustedControls.hasAdjustedBadge
    && adjustedControls.hasResetButton
    && adjustedControls.selectedPreset === 'Photo'
    && photoSpeckle === '10'
    && !resetControls.hasAdjustedBadge
    && resetControls.speckle === '10'
    && resetControls.selectedPreset === 'Photo'
    && collapsedAgain.advancedExpanded === 'false'
    && !collapsedAgain.hasAdvancedContent
    && reopenedSpeckle === '10';

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
    && controlsOk
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
    controls: {
      ok: controlsOk,
      initial: initialControls,
      opened: openedControls,
      adjusted: adjustedControls,
      reset: resetControls,
      collapsedAgain,
    },
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
