import { chromium } from 'playwright';
const url = 'file:///Users/paolo/stardust-migrations/clover/stardust/prototypes/home-proposed.html';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2500);

const layers = () => page.evaluate(() => {
  const out = {};
  for (const cls of ['mini','flex','duo','kds','kiosk']) {
    const el = document.querySelector('.hw-media-' + cls);
    out[cls] = { tag: el.tagName, opacity: getComputedStyle(el).opacity, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) };
  }
  const vis = [...document.querySelectorAll('.device-slide')].find(s => getComputedStyle(s).display !== 'none');
  out.slideName = vis ? vis.querySelector('h3').textContent : null;
  out.floatingFeatured = document.querySelectorAll('.device-featured').length;
  return out;
});

await page.locator('.device-carousel').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
console.log('MINI (default):', JSON.stringify(await layers()));
await page.locator('section[data-section="hardware"]').screenshot({ path: '/tmp/v3-hw-mini.png' });

await page.check('#device-flex', { force: true });
await page.waitForTimeout(800);
console.log('FLEX checked:', JSON.stringify(await layers()));
await page.locator('section[data-section="hardware"]').screenshot({ path: '/tmp/v3-hw-flex.png' });

await page.check('#device-duo', { force: true });
await page.waitForTimeout(1500);
const duo = await layers();
const duoVideo = await page.evaluate(() => { const v = document.querySelector('.hw-media-duo'); return { tag: v.tagName, src: v.currentSrc.slice(0, 90), readyState: v.readyState, paused: v.paused }; });
console.log('DUO checked:', JSON.stringify(duo), 'video:', JSON.stringify(duoVideo));

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('overflow:', overflow, '| consoleErrors:', errors.length, errors.slice(0,3));
await page.close();

// reduced motion
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await rm.emulateMedia({ reducedMotion: 'reduce' });
await rm.goto(url, { waitUntil: 'load' });
await rm.waitForTimeout(1200);
const rmOut = await rm.evaluate(() => ({
  videosHidden: [...document.querySelectorAll('video')].every(v => getComputedStyle(v).display === 'none'),
  animated: [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).animationName !== 'none').length,
  slideVisible: getComputedStyle(document.querySelector('.device-slide')).display,
  quoteColor: getComputedStyle(document.querySelector('.quote')).color,
  sectionBg: getComputedStyle(document.querySelector('.hardware')).backgroundColor
}));
console.log('REDUCED MOTION:', JSON.stringify(rmOut));
await browser.close();
