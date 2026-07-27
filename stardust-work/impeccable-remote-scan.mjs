// Assessment B: inject impeccable browser detector into live clover.com pages.
import { chromium } from 'playwright';
import fs from 'node:fs';

const DETECTOR = '/Users/paolo/.claude/plugins/cache/impeccable/impeccable/3.9.1/skills/impeccable/scripts/detector/detect-antipatterns-browser.js';
const detectorSrc = fs.readFileSync(DETECTOR, 'utf8');

const PAGES = [
  'https://www.clover.com/',
  'https://www.clover.com/pricing',
  'https://www.clover.com/pos-systems',
];

const results = [];

const browser = await chromium.launch({ headless: true });

for (const url of PAGES) {
  const entry = { url, console: [], preflight: {}, findings: null, errors: [] };
  results.push(entry);
  // bypassCSP so inline detector injection works even if the site sets a strict CSP
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    bypassCSP: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  page.on('console', msg => {
    const t = msg.text();
    if (t.includes('impeccable') || t.includes('%c')) {
      entry.console.push(`[${msg.type()}] ${t}`);
    }
  });
  page.on('pageerror', e => entry.errors.push('pageerror: ' + e.message));

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);

    // Preflight: mutate title + append a script tag
    entry.preflight = await page.evaluate(() => {
      const before = document.title;
      document.title = 'impeccable-preflight';
      const s = document.createElement('script');
      s.textContent = 'window.__impeccablePreflight = 42;';
      document.head.appendChild(s);
      return {
        titleMutated: document.title === 'impeccable-preflight',
        inlineScriptRan: window.__impeccablePreflight === 42,
        originalTitle: before,
      };
    });
    // restore title
    await page.evaluate(() => { document.title = document.title; });

    // Disable auto-scan overlays? No — keep autoScan so console summary is emitted,
    // then also grab structured findings.
    await page.addScriptTag({ content: detectorSrc });
    await page.waitForTimeout(3000);

    entry.findings = await page.evaluate(async () => {
      if (typeof window.impeccableDetectAsync !== 'function') return { error: 'impeccableDetectAsync missing' };
      try {
        return await window.impeccableDetectAsync();
      } catch (e) {
        return { error: String(e && e.message || e) };
      }
    });
  } catch (e) {
    entry.errors.push('fatal: ' + e.message);
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync('/Users/paolo/stardust-migrations/clover/impeccable-remote-scan-results.json', JSON.stringify(results, null, 2));

// Print compact summary
for (const r of results) {
  console.log('=== ' + r.url + ' ===');
  console.log('preflight:', JSON.stringify(r.preflight));
  console.log('errors:', r.errors.length ? r.errors.join(' | ') : 'none');
  if (Array.isArray(r.findings)) {
    const counts = {};
    for (const grp of r.findings) for (const f of grp.findings) counts[f.type] = (counts[f.type] || 0) + 1;
    console.log('finding groups:', r.findings.length, 'by type:', JSON.stringify(counts));
  } else {
    console.log('findings:', JSON.stringify(r.findings));
  }
  console.log('console lines:', r.console.length);
}
