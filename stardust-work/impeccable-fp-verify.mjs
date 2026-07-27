// Assessment B supplement: verify false-positive candidates + deterministic in-page checks
import { chromium } from 'playwright';
import fs from 'node:fs';

const PAGES = [
  'https://www.clover.com/',
  'https://www.clover.com/pricing',
  'https://www.clover.com/pos-systems',
];

const browser = await chromium.launch({ headless: true });
const out = [];

const inPageChecks = () => {
  const res = {};
  const vis = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // 1. gradient-text elements (background-clip:text + gradient)
  const grad = [];
  // 2. accent stripes: border-left > 1px, colored (non-neutral)
  const stripes = [];
  // 3. eyebrows: <14px, uppercase, letter-spacing >1px
  const eyebrows = [];
  // 4. z-index > 100
  const zhigh = [];
  // 5. "theater" text occurrences
  const theater = [];

  const selOf = el => {
    if (el.id) return '#' + CSS.escape(el.id);
    let s = el.tagName.toLowerCase();
    if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).map(c => CSS.escape(c)).join('.');
    return s;
  };

  const all = document.querySelectorAll('*');
  for (const el of all) {
    if (el.closest('script,style,noscript')) continue;
    const cs = getComputedStyle(el);
    // gradient text
    const clip = cs.webkitBackgroundClip || cs.backgroundClip;
    if (clip === 'text' && cs.backgroundImage.includes('gradient')) {
      grad.push({ sel: selOf(el), text: (el.textContent || '').trim().slice(0, 60), bg: cs.backgroundImage.slice(0, 100), visible: vis(el) });
    }
    // accent stripe
    const blw = parseFloat(cs.borderLeftWidth);
    if (blw > 1 && cs.borderLeftStyle !== 'none' && vis(el)) {
      const c = cs.borderLeftColor;
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const [r, g, b] = [+m[1], +m[2], +m[3]];
        const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 16;
        const otherSame = cs.borderRightWidth === cs.borderLeftWidth && cs.borderTopWidth === cs.borderLeftWidth;
        if (!isNeutral && !otherSame) stripes.push({ sel: selOf(el), color: c, width: blw });
      }
    }
    // eyebrow
    const fs_ = parseFloat(cs.fontSize);
    const ls = parseFloat(cs.letterSpacing);
    const isUpper = cs.textTransform === 'uppercase';
    if (fs_ < 14 && isUpper && !Number.isNaN(ls) && ls > 1 && vis(el) && (el.textContent || '').trim().length > 1 && el.children.length === 0) {
      const next = el.nextElementSibling || el.parentElement?.nextElementSibling;
      const nearHeading = !!(next && /^H[1-6]$/.test(next.tagName)) ||
        !!(el.parentElement && el.parentElement.querySelector('h1,h2,h3,h4,h5,h6'));
      eyebrows.push({ sel: selOf(el), text: (el.textContent || '').trim().slice(0, 50), fontSize: fs_, letterSpacing: ls, nearHeading });
    }
    // z-index
    const z = parseInt(cs.zIndex, 10);
    if (!Number.isNaN(z) && z > 100) zhigh.push({ sel: selOf(el), z });
  }

  // "theater" occurrences
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (/theater|theatre/i.test(n.nodeValue)) {
      theater.push({ parent: selOf(n.parentElement), text: n.nodeValue.trim().slice(0, 120) });
    }
  }

  // hero heading overflow (current viewport)
  const overflows = [];
  for (const h of document.querySelectorAll('h1,h2,h3')) {
    if (h.scrollWidth > h.clientWidth + 1 && vis(h)) {
      overflows.push({ sel: selOf(h), scrollWidth: h.scrollWidth, clientWidth: h.clientWidth, text: (h.textContent || '').trim().slice(0, 60) });
    }
  }

  res.gradientText = grad;
  res.accentStripes = stripes.slice(0, 20);
  res.accentStripeCount = stripes.length;
  res.eyebrows = eyebrows.slice(0, 20);
  res.eyebrowCount = eyebrows.length;
  res.zIndexOver100 = zhigh.slice(0, 25);
  res.zIndexOver100Count = zhigh.length;
  res.theaterText = theater;
  res.headingOverflows = overflows;
  return res;
};

const heroBgCheck = () => {
  // Verify what actually sits behind the hero h1 (detector said #ffffff on #ffffff)
  const h1 = document.querySelector('h1');
  if (!h1) return null;
  const r = h1.getBoundingClientRect();
  const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return stack.slice(0, 8).map(el => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
      bgColor: cs.backgroundColor,
      bgImage: cs.backgroundImage === 'none' ? 'none' : cs.backgroundImage.slice(0, 60),
      isMedia: ['video', 'img', 'picture'].includes(el.tagName.toLowerCase()),
    };
  });
};

for (const url of PAGES) {
  const entry = { url };
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    bypassCSP: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    entry.desktop = await page.evaluate(inPageChecks);
    entry.heroStack = await page.evaluate(heroBgCheck);
    // 390px pass for hero clamp overflow
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    entry.mobileHeadingOverflows = await page.evaluate(() => {
      const out = [];
      for (const h of document.querySelectorAll('h1,h2,h3')) {
        const r = h.getBoundingClientRect();
        if (r.width > 0 && h.scrollWidth > h.clientWidth + 1) {
          out.push({ tag: h.tagName, cls: (h.className || '').slice(0, 60), scrollWidth: h.scrollWidth, clientWidth: h.clientWidth, text: (h.textContent || '').trim().slice(0, 60) });
        }
      }
      return out;
    });
  } catch (e) {
    entry.error = e.message;
  }
  out.push(entry);
  await ctx.close();
}

await browser.close();
fs.writeFileSync('/Users/paolo/stardust-migrations/clover/impeccable-fp-verify-results.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 12000));
