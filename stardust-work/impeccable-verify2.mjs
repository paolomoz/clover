// Verify: (a) what HTML triggered theater/gradient-text regexes, (b) re-scan with cookie banner removed
import { chromium } from 'playwright';
import fs from 'node:fs';

const DETECTOR = '/Users/paolo/.claude/plugins/cache/impeccable/impeccable/3.9.1/skills/impeccable/scripts/detector/detect-antipatterns-browser.js';
const detectorSrc = fs.readFileSync(DETECTOR, 'utf8');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
await page.goto('https://www.clover.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

const regexHits = await page.evaluate(() => {
  const html = document.documentElement.outerHTML;
  const out = {};
  // theater
  const bodyText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const tm = /\b(\w+)\s+theater\b/i.exec(bodyText);
  out.theaterMatch = tm ? tm[0] : null;
  if (tm) out.theaterContext = bodyText.substring(Math.max(0, tm.index - 150), tm.index + 150).replace(/\s+/g, ' ');
  // gradient-text
  const gradientRe = /(?:-webkit-)?background-clip\s*:\s*text/gi;
  let gm; const ctxs = [];
  while ((gm = gradientRe.exec(html)) !== null && ctxs.length < 3) {
    const start = Math.max(0, gm.index - 200);
    const context = html.substring(start, gm.index + gm[0].length + 200);
    if (/gradient/i.test(context)) ctxs.push(context.replace(/\s+/g, ' ').slice(0, 300));
  }
  out.gradientContexts = ctxs;
  return out;
});
console.log('REGEX HITS:', JSON.stringify(regexHits, null, 1));

// Remove cookie consent UI entirely, then inject detector
await page.evaluate(() => {
  document.querySelectorAll('#onetrust-consent-sdk, #onetrust-banner-sdk, .onetrust-pc-dark-filter, #onetrust-pc-sdk').forEach(e => e.remove());
});
await page.waitForTimeout(500);
await page.addScriptTag({ content: detectorSrc.replace('if (window.__IMPECCABLE_CONFIG__?.autoScan !== false)', 'if (false)') });
await page.waitForTimeout(500);
const findings = await page.evaluate(async () => await window.impeccableDetectAsync());
const lowContrast = [];
for (const g of findings) for (const f of g.findings) {
  if (f.type === 'low-contrast' || f.type === 'gray-on-color') lowContrast.push({ sel: g.selector, type: f.type, detail: f.detail });
}
console.log('CONTRAST FINDINGS AFTER BANNER REMOVAL (' + findings.length + ' groups total):');
console.log(JSON.stringify(lowContrast, null, 1));
await browser.close();
