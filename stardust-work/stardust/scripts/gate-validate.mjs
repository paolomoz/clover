// Phase 2.5–2.8 gate runner for stardust prototypes.
// Usage: node stardust/scripts/gate-validate.mjs <slug>
import { chromium } from 'playwright';
import fs from 'node:fs';

const slug = process.argv[2];
const file = `stardust/prototypes/${slug}-proposed.html`;
const url = 'file://' + process.cwd() + '/' + file;
const outDir = `stardust/validation/${slug}`;
fs.mkdirSync(outDir, { recursive: true });

const findings = [];
const note = (sev, cat, msg) => findings.push({ sev, cat, msg });

const browser = await chromium.launch({ headless: true });

// luminance/contrast helpers
const contrastJS = `
  const lum = (r,g,b) => { const f = c => { c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const parse = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p = m[1].split(',').map(Number); return { r:p[0], g:p[1], b:p[2], a:p[3]===undefined?1:p[3] }; };
  const bgOf = el => { let n = el; while(n && n !== document.documentElement){ const c = parse(getComputedStyle(n).backgroundColor); if(c && c.a > 0.9) return c; if(getComputedStyle(n).backgroundImage !== 'none') return null; n = n.parentElement; } return { r:255,g:255,b:255,a:1 }; };
  const ratio = (f,b) => { const l1 = lum(f.r,f.g,f.b), l2 = lum(b.r,b.g,b.b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
`;

// ---- Pass 1: desktop full audit ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = []; const netFails = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('requestfailed', r => { if (!r.url().startsWith('data:')) netFails.push(r.url().slice(-90)); });
  page.on('response', r => { if (r.status() >= 400) netFails.push(r.status() + ' ' + r.url().slice(-90)); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  if (consoleErrors.length) note('P1', 'audit/console', consoleErrors.slice(0, 3).join(' | '));
  if (netFails.length) note('P1', 'audit/assets', 'failed: ' + netFails.slice(0, 5).join(' | '));

  const structural = await page.evaluate(() => {
    const out = { headings: [], noAlt: [], lcp: null, skip: null, jsonld: null, placeholders: 0, dataSections: 0, sectionsWithout: [] };
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => out.headings.push(+h.tagName[1]));
    document.querySelectorAll('img:not([alt])').forEach(i => out.noAlt.push((i.getAttribute('src') || '').slice(-50)));
    const firstImg = [...document.querySelectorAll('img')].find(i => { const r = i.getBoundingClientRect(); return r.top < 900 && r.width > 100; });
    if (firstImg) out.lcp = { eager: firstImg.loading !== 'lazy', fp: firstImg.getAttribute('fetchpriority') === 'high', src: (firstImg.getAttribute('src') || '').slice(-50) };
    out.skip = !!document.querySelector('a.skip-link[href="#main"]');
    try { document.querySelectorAll('script[type="application/ld+json"]').forEach(s => JSON.parse(s.textContent)); out.jsonld = 'parses'; } catch (e) { out.jsonld = 'PARSE ERROR: ' + e.message; }
    out.placeholders = document.querySelectorAll('[data-placeholder]').length;
    out.dataSections = document.querySelectorAll('[data-section]').length;
    document.querySelectorAll('main > section, body > header, body > footer').forEach(s => { if (!s.hasAttribute('data-section')) out.sectionsWithout.push(s.className.slice(0, 40)); });
    return out;
  });

  const h1s = structural.headings.filter(l => l === 1).length;
  if (h1s !== 1) note('P0', 'audit/headings', `${h1s} h1 elements (need exactly 1)`);
  let prev = 0; let skips = [];
  for (const l of structural.headings) { if (prev && l > prev + 1) skips.push(`${prev}->${l}`); prev = l; }
  if (skips.length) note('P1', 'audit/headings', 'level skips: ' + skips.join(','));
  if (structural.noAlt.length) note('P1', 'audit/a11y', 'imgs missing alt attr: ' + structural.noAlt.join(','));
  if (structural.lcp && (!structural.lcp.eager || !structural.lcp.fp)) note('P1', 'audit/perf', `LCP img not eager+fetchpriority=high (${JSON.stringify(structural.lcp)})`);
  if (!structural.skip) note('P0', 'audit/a11y', 'skip link missing');
  if (structural.jsonld !== 'parses') note('P1', 'audit/seo', structural.jsonld);
  if (structural.sectionsWithout.length) note('P1', 'contract/data-attributes', 'sections missing data-section: ' + structural.sectionsWithout.join(','));

  // contrast computation over visible text nodes
  const contrast = await page.evaluate(`(() => { ${contrastJS}
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fg = parse(cs.color); const bg = bgOf(el);
      if (!fg || !bg) continue; // text over imagery handled by poster rule review
      const px = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700;
      const large = px >= 24 || (bold && px >= 18.66);
      const need = large ? 3 : 4.5;
      const c = ratio(fg, bg);
      if (c < need) bad.push({ text: t.textContent.trim().slice(0, 40), c: +c.toFixed(2), need, px, color: cs.color, bg: JSON.stringify(bg) });
    }
    return bad.slice(0, 12);
  })()`);
  for (const b of contrast) note('P1', 'audit/contrast', `${b.c}:1 (need ${b.need}) "${b.text}" ${b.px}px ${b.color} on ${b.bg}`);

  // accordion smoke
  const acc = await page.evaluate(() => {
    const d = document.querySelectorAll('details'); if (!d.length) return null;
    const first = d[0].open; d[1] && (d[1].open = true);
    const visible = d[1] ? d[1].querySelector('.answer').getBoundingClientRect().height > 0 : true;
    return { count: d.length, firstOpen: first, toggleWorks: visible };
  });
  if (acc && !acc.firstOpen) note('P2', 'audit/interaction', 'first accordion item not open by default');
  if (acc && !acc.toggleWorks) note('P1', 'audit/interaction', 'accordion toggle does not reveal content');

  await page.screenshot({ path: `${outDir}/1440.png`, fullPage: true });
  console.log('desktop structural:', JSON.stringify({ headings: structural.headings.join(','), placeholders: structural.placeholders, dataSections: structural.dataSections, accordion: acc }));
  await page.close();
}

// ---- Pass 2: viewport sweep (adapt gate) ----
for (const [w, h] of [[1920, 1080], [1280, 900], [800, 900], [768, 1024], [414, 800], [390, 844], [375, 800], [360, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = Math.max(doc.scrollWidth - doc.clientWidth, document.body.scrollWidth - document.body.clientWidth);
    let navMin = null; let gapMin = null;
    document.querySelectorAll('header nav').forEach(n => {
      n.querySelectorAll('a').forEach(a => { const fs = parseFloat(getComputedStyle(a).fontSize); navMin = navMin === null ? fs : Math.min(navMin, fs); });
      const g = parseFloat(getComputedStyle(n).columnGap || getComputedStyle(n).gap);
      if (!isNaN(g)) gapMin = gapMin === null ? g : Math.min(gapMin, g);
    });
    return { overflow, navMin, gapMin };
  });
  if (r.overflow > 1) note('P1', 'adapt/overflow', `horizontal overflow ${r.overflow}px at ${w}`);
  if (w === 360) {
    if (r.navMin !== null && r.navMin < 11) note('P1', 'adapt/nav-readability-floor', `nav font ${r.navMin}px at 360`);
    if (r.gapMin !== null && r.gapMin < 10) note('P1', 'adapt/nav-readability-floor', `nav gap ${r.gapMin}px at 360`);
  }
  if (w === 768) await page.screenshot({ path: `${outDir}/768.png`, fullPage: true });
  if (w === 390) await page.screenshot({ path: `${outDir}/390.png`, fullPage: true });
  await page.close();
}

// meta viewport + media query floor (source checks)
const src = fs.readFileSync(file, 'utf8');
if (!/meta name="viewport" content="width=device-width/.test(src)) note('P0', 'adapt/viewport-meta', 'viewport meta missing/fixed');
const mqs = [...src.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map(m => +m[1]);
if (!mqs.length) note('P0', 'adapt/media-queries', 'no max-width media queries');
else if (Math.min(...mqs) > 640) note('P1', 'adapt/media-queries', 'narrowest breakpoint above 640px');
// JS-dependent hidden state detector (broken-by-default)
if (/(clip-path:\s*inset\(0\s+100%|transform:\s*translate[XY]\(-?100%)/.test(src)) note('P0', 'audit/js-hidden', 'suspicious hidden initial state');

// ---- Pass 3: reduced motion ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const rm = await page.evaluate(() => {
    const animated = [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).animationName !== 'none').length;
    const hidden = [...document.querySelectorAll('main h1, main h2, main p')].filter(e => +getComputedStyle(e).opacity === 0).length;
    return { animated, hiddenText: hidden };
  });
  if (rm.animated > 0) note('P1', 'motion/reduced-motion', `${rm.animated} elements still animated under reduce`);
  if (rm.hiddenText > 0) note('P0', 'motion/hidden-state', `${rm.hiddenText} text elements at opacity 0 under reduce`);
  await page.close();
}

// ---- Pass 4: scroll-driven end state (motion gate: content visible after full scroll; and at rest mid-page) ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const endHidden = await page.evaluate(() => [...document.querySelectorAll('main h2, main h3, main p')].filter(e => { const r = e.getBoundingClientRect(); return r.top > -200 && r.top < 1100 && +getComputedStyle(e).opacity === 0; }).length);
  if (endHidden) note('P1', 'motion/anim-reachability', `${endHidden} elements still opacity:0 in final viewport after full scroll`);
  await page.close();
}

await browser.close();

const p0 = findings.filter(f => f.sev === 'P0'), p1 = findings.filter(f => f.sev === 'P1'), p2 = findings.filter(f => f.sev === 'P2');
console.log(`\n==== ${slug} gate result: P0=${p0.length} P1=${p1.length} P2=${p2.length}`);
for (const f of findings) console.log(`  ${f.sev} [${f.cat}] ${f.msg}`);
fs.writeFileSync(`${outDir}/gate-findings.json`, JSON.stringify(findings, null, 2));
process.exit(0);
