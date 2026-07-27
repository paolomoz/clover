// Final verification: clean detectAsync (no autoScan, no banner) type counts + hero backdrop media check
import { chromium } from 'playwright';
import fs from 'node:fs';

const DETECTOR = '/Users/paolo/.claude/plugins/cache/impeccable/impeccable/3.9.1/skills/impeccable/scripts/detector/detect-antipatterns-browser.js';
const detectorSrc = fs.readFileSync(DETECTOR, 'utf8').replace("if (window.__IMPECCABLE_CONFIG__?.autoScan !== false)", 'if (false)');

const browser = await chromium.launch({ headless: true });

for (const url of ['https://www.clover.com/', 'https://www.clover.com/pricing', 'https://www.clover.com/pos-systems']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => document.querySelectorAll('#onetrust-consent-sdk, #onetrust-banner-sdk, .onetrust-pc-dark-filter, #onetrust-pc-sdk').forEach(e => e.remove()));
  await page.addScriptTag({ content: detectorSrc });
  await page.waitForTimeout(300);
  const findings = await page.evaluate(async () => await window.impeccableDetectAsync());
  const counts = {};
  for (const g of findings) for (const f of g.findings) counts[f.type] = (counts[f.type] || 0) + 1;
  console.log('=== ' + url + ' === groups:', findings.length, JSON.stringify(counts));

  if (url === 'https://www.clover.com/') {
    // What is actually behind the flagged white-text elements?
    const backdrop = await page.evaluate(() => {
      const sels = [
        'div[class*="LandingPageHero_landing-page-hero__wrapper"] > h1',
        'h1[class*="VideoCarouselHeading_headline"]',
        'h2[class*="TestimonialShowcase_quote-text"]',
      ];
      return sels.map(sel => {
        const el = document.querySelector(sel);
        if (!el) return { sel, found: false };
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        const stack = document.elementsFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
        const media = stack.find(e => ['VIDEO', 'IMG', 'PICTURE', 'CANVAS'].includes(e.tagName));
        const bgImgAncestor = stack.find(e => getComputedStyle(e).backgroundImage !== 'none');
        const solidBg = stack.find(e => { const c = getComputedStyle(e).backgroundColor; return c && !c.startsWith('rgba(0, 0, 0, 0)'); });
        return {
          sel,
          found: true,
          mediaBehind: media ? media.tagName.toLowerCase() + (media.currentSrc ? ':' + media.currentSrc.slice(0, 80) : '') : null,
          bgImageBehind: bgImgAncestor ? getComputedStyle(bgImgAncestor).backgroundImage.slice(0, 90) : null,
          firstSolidBgColor: solidBg ? getComputedStyle(solidBg).backgroundColor : null,
        };
      });
    });
    console.log('HERO BACKDROPS:', JSON.stringify(backdrop, null, 1));
  }
  await ctx.close();
}
await browser.close();
