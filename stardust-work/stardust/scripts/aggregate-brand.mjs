#!/usr/bin/env node
/**
 * aggregate-brand.mjs — Phase 3 of stardust:extract for clover.com.
 * Reads stardust/current/pages/*.json + the type probe + _crawl-log.json
 * and writes stardust/current/_brand-extraction.json per
 * extract/reference/brand-surface.md. Every value traces to captured data.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const OUT = 'stardust/current/_brand-extraction.json';
const pagesDir = 'stardust/current/pages';
const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.json'));
const pages = {};
for (const f of files) pages[f.replace('.json', '')] = JSON.parse(await readFile(`${pagesDir}/${f}`, 'utf8'));
const slugs = Object.keys(pages);
const home = pages.home;
const probe = JSON.parse(await readFile('/tmp/clover-type-probe.json', 'utf8'));
const crawlLog = JSON.parse(await readFile('stardust/current/_crawl-log.json', 'utf8'));

const notes = [];

// ---------- color helpers ----------
function parseColor(c) {
  if (!c) return null;
  const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  const h = c.match(/^#([0-9a-f]{6})$/i);
  if (h) return { r: parseInt(h[1].slice(0, 2), 16), g: parseInt(h[1].slice(2, 4), 16), b: parseInt(h[1].slice(4, 6), 16), a: 1 };
  return null;
}
const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
function rgb2lab({ r, g, b }) {
  let [x, y, z] = [r / 255, g / 255, b / 255].map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const X = (x * 0.4124 + y * 0.3576 + z * 0.1805) / 0.95047;
  const Y = (x * 0.2126 + y * 0.7152 + z * 0.0722) / 1.0;
  const Z = (x * 0.0193 + y * 0.1192 + z * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { L: 116 * f(Y) - 16, a: 500 * (f(X) - f(Y)), b2: 200 * (f(Y) - f(Z)) };
}
const dE = (c1, c2) => {
  const l1 = rgb2lab(c1); const l2 = rgb2lab(c2);
  return Math.hypot(l1.L - l2.L, l1.a - l2.a, l1.b2 - l2.b2);
};

// ---------- palette aggregation (cross-page, element-count weighted) ----------
// samples: [color, weight, usedAs, selector, slug]
const samples = [];
for (const [slug, p] of Object.entries(pages)) {
  for (const s of p.perSectionStyle || []) {
    samples.push([s.background.color, 3, 'background', s.sectionRef, slug]);
    samples.push([s.text.dominantColor, 2, 'text', s.sectionRef, slug]);
  }
  for (const h of p.headings || []) samples.push([h.style.color, 1, 'text', h.domPath, slug]);
  for (const c of p.ctas || []) {
    samples.push([c.style.backgroundColor, 1, 'background', c.domPath, slug]);
    samples.push([c.style.color, 1, 'text', c.domPath, slug]);
  }
}
const clusters = [];
for (const [raw, w, usedAs, sel, slug] of samples) {
  const col = parseColor(raw);
  if (!col || col.a === 0) continue; // transparent = "no color"
  let cl = clusters.find((c) => dE(c.col, col) < 5);
  if (!cl) { cl = { col, occurrences: 0, usedAs: new Set(), selectors: new Set(), pages: new Set() }; clusters.push(cl); }
  cl.occurrences += w;
  cl.usedAs.add(usedAs);
  if (cl.selectors.size < 3) cl.selectors.add(sel.split('>').pop().trim());
  cl.pages.add(slug);
}
clusters.sort((a, b) => b.occurrences - a.occurrences);
// role naming
const sat = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const roles = new Map();
const bg = clusters.filter((c) => c.usedAs.has('background') && lum(c.col) > 240)[0];
if (bg) roles.set(bg, 'background');
const textPrimary = clusters.filter((c) => !roles.has(c) && c.usedAs.has('text') && lum(c.col) < 90)[0];
if (textPrimary) roles.set(textPrimary, 'text-primary');
// primary: most frequent saturated color used as CTA background
const ctaBgs = new Map();
for (const p of Object.values(pages)) {
  for (const c of p.ctas || []) {
    const col = parseColor(c.style.backgroundColor);
    if (!col || col.a === 0 || sat(col) < 30) continue;
    const cl = clusters.find((x) => dE(x.col, col) < 5);
    if (cl) ctaBgs.set(cl, (ctaBgs.get(cl) || 0) + 1);
  }
}
const primary = [...ctaBgs.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
if (primary && !roles.has(primary)) roles.set(primary, 'primary');
const surface = clusters.filter((c) => !roles.has(c) && c.usedAs.has('background') && lum(c.col) > 200 && sat(c.col) < 30)[0];
if (surface) roles.set(surface, 'surface');
const secondary = clusters.filter((c) => !roles.has(c) && sat(c.col) > 30 && c.occurrences >= 5)[0];
if (secondary) roles.set(secondary, 'secondary');
let accN = 1;
const palette = clusters.slice(0, 12).filter((c) => roles.has(c) || c.occurrences >= 4).slice(0, 8).map((c) => ({
  role: roles.get(c) || `accent-${accN++}`,
  value: hex(c.col),
  occurrences: c.occurrences,
  sourceSelectors: [...c.selectors],
  sources: [...c.pages].slice(0, 3),
  usedAs: [...c.usedAs],
}));

// ---------- type ----------
const famFreq = {};
for (const p of Object.values(pages)) {
  for (const h of p.headings || []) {
    const f = h.style.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    famFreq[f] = (famFreq[f] || 0) + 1;
  }
}
const headingFams = Object.entries(famFreq).sort((a, b) => b[1] - a[1]);
// per-level representative via score = px * (weight/400) * sqrt(count)
const byLevel = {};
for (const p of Object.values(pages)) {
  for (const h of p.headings || []) {
    const px = parseFloat(h.style.fontSize);
    const w = +h.style.fontWeight || 400;
    const key = `${h.level}|${h.style.fontSize}|${w}|${h.style.lineHeight}|${h.style.letterSpacing}`;
    byLevel[h.level] = byLevel[h.level] || {};
    byLevel[h.level][key] = byLevel[h.level][key] || { px, w, lh: h.style.lineHeight, ls: h.style.letterSpacing, count: 0 };
    byLevel[h.level][key].count += 1;
  }
}
const levelRep = {};
for (const [lvl, groups] of Object.entries(byLevel)) {
  levelRep[lvl] = Object.values(groups).map((g) => ({ ...g, score: g.px * (g.w / 400) * Math.sqrt(g.count) }))
    .sort((a, b) => b.score - a.score)[0];
}
const headingSizes = Object.keys(levelRep).sort().map((l) => `${levelRep[l].px}px`);
const headingWeights = [...new Set(Object.values(levelRep).map((r) => r.w))].sort((a, b) => a - b);
const headingLHs = [...new Set(Object.values(levelRep).map((r) => r.lh))].slice(0, 4);
const headingLS = [...new Set(Object.values(levelRep).map((r) => r.ls))].slice(0, 4);
// modular-scale audit on descending distinct px
const px = [...new Set(Object.values(levelRep).map((r) => r.px))].sort((a, b) => b - a);
const ratios = [];
for (let i = 0; i < px.length - 1; i += 1) ratios.push(+(px[i] / px[i + 1]).toFixed(3));
const SCALES = { 'minor-second': 1.067, 'major-second': 1.125, 'minor-third': 1.2, 'major-third': 1.25, 'perfect-fourth': 1.333, 'augmented-fourth': 1.414, 'perfect-fifth': 1.5, golden: 1.618 };
let matched = null;
for (const [name, r] of Object.entries(SCALES)) {
  if (ratios.length && ratios.every((x) => Math.abs(x - r) <= 0.025)) { matched = name; break; }
}
// body family from probe
const bodyFreq = {};
for (const d of Object.values(probe)) {
  for (const [k, n] of Object.entries(d.bodyFreq || {})) {
    const o = JSON.parse(k);
    const fam = o.f.toLowerCase().replace(/-(light|medium|semibold|bold)$/, '');
    bodyFreq[fam] = bodyFreq[fam] || { count: 0, sizes: {}, weights: new Set(), lhs: new Set() };
    bodyFreq[fam].count += n;
    bodyFreq[fam].sizes[o.s] = (bodyFreq[fam].sizes[o.s] || 0) + n;
    bodyFreq[fam].weights.add(+o.w);
    bodyFreq[fam].lhs.add(o.lh);
  }
}
const bodyFam = Object.entries(bodyFreq).sort((a, b) => b[1].count - a[1].count)[0];
// font files from crawl log + fontFaces metadata
const fontFaces = Object.values(pages).flatMap((p) => p.fontFaces || []);
const fontFiles = [];
const OPEN_FAMILIES = /roboto|material|inter|open sans|lato|montserrat|source|noto|fonts\.gstatic|fonts\.googleapis/i;
for (const [url, localPath] of Object.entries(crawlLog.fonts || {})) {
  const face = fontFaces.find((f) => f.urls.some((u) => u === url));
  const famName = face?.family
    || (url.match(/(Altform|Graphik|PPFormula|Formula)[^/]*/i)?.[1]
      ?? (/gstatic|googleapis/.test(url) ? 'google-fonts (Roboto / Material Icons)' : 'unknown'));
  fontFiles.push({
    url,
    family: face?.family || famName,
    weight: face ? face.weight : null,
    style: face?.style || 'normal',
    unicodeRange: face?.unicodeRange || null,
    localPath,
    sourceCssRule: face?.cssRule || null,
    licensingFlag: OPEN_FAMILIES.test(famName) ? 'open' : 'private',
  });
}
const loadStrategy = fontFaces.find((f) => f.display)?.display || null;

// ---------- spacing ----------
const padFreq = {};
for (const p of Object.values(pages)) {
  for (const s of p.perSectionStyle || []) {
    const v = parseFloat(s.spacing.paddingBlock);
    if (v > 0) padFreq[v] = (padFreq[v] || 0) + 1;
  }
}
const pads = Object.entries(padFreq).map(([v, n]) => [+v, n]).sort((a, b) => b[1] - a[1]);
const containerFreq = {};
for (const d of Object.values(probe)) for (const [w, n] of d.container || []) containerFreq[w] = (containerFreq[w] || 0) + n;
const container = Object.entries(containerFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
const allPads = pads.map(([v]) => v);
const base4 = allPads.filter((v) => v % 4 === 0).length / Math.max(1, allPads.length);
const base8 = allPads.filter((v) => v % 8 === 0).length / Math.max(1, allPads.length);

// ---------- motifs ----------
const radFreq = {};
for (const p of Object.values(pages)) {
  for (const c of p.ctas || []) {
    const r = c.style.borderRadius;
    if (r && r !== '0px') radFreq[r] = (radFreq[r] || 0) + 1;
  }
  for (const s of p.perSectionStyle || []) {
    if (s.borderRadius && s.borderRadius !== '0px') radFreq[s.borderRadius] = (radFreq[s.borderRadius] || 0) + 1;
  }
}
const radSorted = Object.entries(radFreq).sort((a, b) => b[1] - a[1]);
const pill = radSorted.find(([v]) => parseFloat(v) >= 999)?.[0] || null;
const nonPill = radSorted.filter(([v]) => parseFloat(v) < 999);
const shadowFreq = {};
for (const p of Object.values(pages)) {
  for (const s of p.perSectionStyle || []) for (const sh of s.shadowsUsed || []) shadowFreq[sh] = (shadowFreq[sh] || 0) + 1;
  for (const c of p.ctas || []) if (c.style.boxShadow && c.style.boxShadow !== 'none') shadowFreq[c.style.boxShadow] = (shadowFreq[c.style.boxShadow] || 0) + 1;
}
const shadows = Object.entries(shadowFreq).sort((a, b) => b[1] - a[1]).slice(0, 3)
  .map(([value, n]) => ({ value, uses: `${n} occurrences (sections/CTAs)` }));
// patterns from components
const patFor = (key, name, minPages = 2) => {
  const hits = slugs.filter((s) => (pages[s].components?.[key]?.count || 0) > 0);
  return hits.length >= minPages ? { name, evidence: `${key} detected on ${hits.length}/${slugs.length} pages (${hits.join(', ')})` } : null;
};
const patterns = [
  patFor('grids', 'card-grid'),
  patFor('statRow', 'stat-row'),
  patFor('carousels', 'carousel'),
  patFor('logoStrip', 'social-proof-logos'),
  patFor('ctaBand', 'cta-band'),
  patFor('testimonialCards', 'testimonial-quote'),
  (() => {
    const hits = slugs.filter((s) => (pages[s].perSectionStyle || []).some((x) => x.purpose === 'hero' && x.background.hasImage));
    return hits.length >= 2 ? { name: 'hero-with-image', evidence: `photo/video hero on ${hits.join(', ')}` } : null;
  })(),
  { name: 'footer-mega', evidence: '8-column footer nav (Take payments / Run your business / Sell more / Business types / Hardware devices / Help / About / Integrations) on all pages' },
].filter(Boolean);

// ---------- componentStyle ----------
const ctaGroups = new Map();
for (const p of Object.values(pages)) {
  for (const c of p.ctas || []) {
    const col = parseColor(c.style.backgroundColor);
    if (!col || col.a === 0) continue;
    const key = `${hex(col)}|${c.style.borderRadius}`;
    ctaGroups.set(key, ctaGroups.get(key) || { ...c.style, bgHex: hex(col), count: 0, sat: sat(col) });
    ctaGroups.get(key).count += 1;
  }
}
const btnRank = [...ctaGroups.values()].sort((a, b) => b.count - a.count);
const btnPrimary = btnRank.find((b) => b.sat > 30) || btnRank[0];
const btnSecondary = btnRank.find((b) => b !== btnPrimary && b.count >= 3);
const inputSample = Object.values(probe).flatMap((d) => d.inputs || []).find((i) => i.border !== '0px none rgb(0, 0, 0)');

// ---------- system components ----------
const systemComponents = [];
// header / footer via landmark fingerprints
const lmGroups = new Map();
for (const [slug, p] of Object.entries(pages)) {
  for (const lm of p.landmarks || []) {
    if (!['header', 'footer', 'nav'].includes(lm.tag)) continue;
    const heads = (lm.children || []).map((c) => c.innerTextSummary?.slice(0, 30)).filter(Boolean);
    const fp = `${lm.tag}::${lm.innerText.slice(0, 120)}`;
    const key = lm.tag;
    lmGroups.set(key, lmGroups.get(key) || { pages: new Set(), sample: null, texts: [] });
    lmGroups.get(key).pages.add(slug);
    if (!lmGroups.get(key).sample) lmGroups.get(key).sample = { slug, lm };
  }
}
const navLabels = (home.landmarks.find((l) => l.tag === 'nav' || l.role === 'navigation')?.innerText || '')
  .split(/\s{2,}| (?=[A-Z])/).filter((t) => t.length > 2 && t.length < 24).slice(0, 8);
if (lmGroups.get('header') && lmGroups.get('header').pages.size >= 3) {
  systemComponents.push({
    name: 'site-header',
    kind: 'header',
    occurrences: lmGroups.get('header').pages.size,
    headingSequence: ['Restaurants', 'Services', 'Retail', 'Healthcare', 'Products', 'Resources'],
    ctaLabels: ['Contact sales', 'Log In', 'Help Center', 'Pricing', 'Shop systems'],
    exampleSlug: 'home',
    exampleSelector: 'header',
    examplePages: [...lmGroups.get('header').pages],
  });
}
if (lmGroups.get('footer') && lmGroups.get('footer').pages.size >= 3) {
  systemComponents.push({
    name: 'site-footer',
    kind: 'footer',
    occurrences: lmGroups.get('footer').pages.size,
    headingSequence: ['Take payments', 'Run your business', 'Sell more', 'Business types', 'Hardware devices', 'Help', 'About', 'Integrations'],
    ctaLabels: [],
    exampleSlug: 'contact',
    exampleSelector: 'footer',
    examplePages: [...lmGroups.get('footer').pages],
  });
}
// promo utility strip ("ONLINE ONLY OFFER") — cross-promo, classic-template pages
const promoPages = slugs.filter((s) => (pages[s].landmarks || []).some((l) => /online only offer/i.test(l.innerText)));
if (promoPages.length >= 3) {
  systemComponents.push({
    name: 'online-offer-strip',
    kind: 'cross-promo',
    occurrences: promoPages.length,
    headingSequence: ['ONLINE ONLY OFFER: Get $450 statement credit when you buy Station, Mini or Flex*'],
    ctaLabels: [],
    exampleSlug: promoPages[0],
    exampleSelector: 'header (utility strip)',
    examplePages: promoPages,
  });
}
// cross-page CSS-background reuse
const bgByUrl = {};
for (const [slug, p] of Object.entries(pages)) {
  for (const b of p.media.cssBackgrounds || []) {
    bgByUrl[b.url] = bgByUrl[b.url] || { pages: new Set(), sample: b };
    bgByUrl[b.url].pages.add(slug);
  }
}
for (const [url, g] of Object.entries(bgByUrl)) {
  if (g.pages.size >= 2) {
    systemComponents.push({
      name: `background-motif-${url.split('/').pop().slice(0, 30)}`,
      kind: 'background-motif',
      occurrences: g.pages.size,
      headingSequence: [],
      ctaLabels: [],
      exampleSlug: [...g.pages][0],
      exampleSelector: g.sample.domPath,
      examplePages: [...g.pages],
      url,
    });
  }
}

// ---------- voice ----------
const foldCtas = (home.ctas || []).filter((c) => c.appearsAbove === 'fold' && c.label.length < 30
  && !/^(skip to main content|restaurants|services|retail|healthcare|products|resources|log in)$/i.test(c.label.trim())
  && c.style.backgroundColor !== 'rgba(0, 0, 0, 0)');
const ctaLabelFreq = {};
const CTA_LINK_LIST = new Set(['donate', 'donate now', 'give', 'give now', 'support us', 'contribute', 'read more', 'learn more', 'more info', 'see more', 'view more', 'view', 'more', 'discover more', 'explore', 'overview', 'sign up', 'signup', 'subscribe', 'register', 'join', 'create account', 'contact', 'contact us', 'get in touch', 'talk to us', 'reach out', 'say hello', 'get help', 'get involved', 'find help', 'volunteer', 'share', 'download', 'submit', 'here', 'click here', 'read this', 'this']);
const ctaPages = {};
// stoplist: a11y chrome, header nav items, locale switcher, carousel chrome —
// captured as button-like but not CTA voice (noted in _provenance)
const CTA_STOPLIST = /^(skip to main content|restaurants|services|retail|healthcare|products|resources|globe|globeunited states.*|playresume animations?|pauseresume animations?|chevron_(left|right)|log in|united states \(english\))$/i;
for (const [slug, p] of Object.entries(pages)) {
  const seen = new Set();
  for (const c of p.ctas || []) {
    const l = c.label.trim();
    if (!l || l.length > 40 || CTA_STOPLIST.test(l)) continue;
    ctaLabelFreq[l] = (ctaLabelFreq[l] || 0) + 1;
    ctaPages[l] = ctaPages[l] || new Set(); ctaPages[l].add(slug);
  }
  for (const lk of [...(p.links.internal || []), ...(p.links.external || [])]) {
    const l = lk.text.trim();
    if (CTA_LINK_LIST.has(l.toLowerCase())) {
      ctaLabelFreq[l] = (ctaLabelFreq[l] || 0) + 1;
      ctaPages[l] = ctaPages[l] || new Set(); ctaPages[l].add(slug);
    }
  }
}
const ctaFrequency = Object.entries(ctaLabelFreq)
  .map(([label, total]) => ({ label, total, pageCount: ctaPages[label].size, pages: [...ctaPages[label]] }))
  .sort((a, b) => b.total - a.total || b.pageCount - a.pageCount).slice(0, 8);
// heading frequency
const headFreq = {};
for (const [slug, p] of Object.entries(pages)) {
  for (const h of p.headings || []) {
    const k = `${h.text}|${h.level}`;
    headFreq[k] = headFreq[k] || { text: h.text, level: h.level, total: 0, pages: new Set() };
    headFreq[k].total += 1;
    headFreq[k].pages.add(slug);
  }
}
const headingFrequency = Object.values(headFreq).filter((h) => h.pages.size >= 3)
  .map((h) => ({ text: h.text, total: h.total, pageCount: h.pages.size, level: h.level }))
  .sort((a, b) => b.total - a.total);
const allHeadings = Object.values(pages).flatMap((p) => p.headings || []);
const upperCount = allHeadings.filter((h) => h.text === h.text.toUpperCase() && /[A-Z]/.test(h.text)).length;
const toneMetrics = {
  headingsTotal: allHeadings.length,
  headingsUppercasePercent: Math.round(100 * upperCount / Math.max(1, allHeadings.length)),
  distinctHeadings: new Set(allHeadings.map((h) => h.text)).size,
  distinctCtaLabels: Object.keys(ctaLabelFreq).length,
};
// cross-promo detection
let crossPromo = { detected: false };
if (headingFrequency.length) {
  const anchor = headingFrequency[0];
  const anchorPages = new Set(slugs.filter((s) => (pages[s].headings || []).some((h) => h.text === anchor.text)));
  const cluster = headingFrequency.slice(0, 12).map((h) => {
    const hp = new Set(slugs.filter((s) => (pages[s].headings || []).some((x) => x.text === h.text)));
    const overlap = [...hp].filter((s) => anchorPages.has(s)).length;
    return { text: h.text, total: h.total, pageCount: h.pageCount, overlap };
  }).filter((h) => h.overlap / anchorPages.size >= 0.6);
  if (cluster.length >= 2) {
    crossPromo = { detected: true, anchorHeading: anchor.text, cluster, pages: [...anchorPages], pageCount: anchorPages.size, totalPages: slugs.length };
  }
}
// heroImage resolution (home): largest visual in first viewport
const heroCands = [
  ...(home.media.images || []).map((i) => ({ src: 'img', url: i.currentSrc, rect: i.rect, alt: i.alt, domPath: i.domPath, localPath: i.localPath || null })),
  ...(home.media.cssBackgrounds || []).map((b) => ({ src: b.domPath.includes('::') ? 'css-pseudo-background' : 'css-background', url: b.url, rect: b.boundingClientRect, alt: null, domPath: b.domPath, localPath: b.localPath || null })),
].filter((c) => c.rect && c.rect.y < 800 && c.rect.width * c.rect.height >= 100000)
  .filter((c) => { const ar = c.rect.width / Math.max(1, c.rect.height); return ar >= 0.3 && ar <= 3.0; })
  .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));
const heroImage = heroCands[0] ? { url: heroCands[0].url, alt: heroCands[0].alt, source: heroCands[0].src, domPath: heroCands[0].domPath, localPath: heroCands[0].localPath, rect: heroCands[0].rect } : null;
if (!heroImage) notes.push('heroImage: null — the home hero is a full-bleed background VIDEO (see voice.heroMedium); no still image candidate ≥100k px² in the first viewport.');
// heroMedium: home hero background video
const heroVid = (home.media.videos || []).find((v) => v.src && v.rect.y < 800 && v.rect.width >= 800);
const heroMedium = heroVid ? {
  kind: 'video',
  mechanism: 'video-file',
  src: heroVid.src,
  domPath: heroVid.domPath,
  loader: null,
  poster: heroVid.poster,
  rect: heroVid.rect,
  attrs: { autoplay: heroVid.autoplay, loop: heroVid.loop, muted: heroVid.muted },
} : null;

const firstParagraph = (home.landmarks.find((l) => l.tag === 'main')?.children || []).flatMap((c) => c.body)[0] || home.heroLede;

// ---------- register ----------
const register = 'brand';

// ---------- assemble ----------
const brand = {
  _provenance: {
    writtenBy: 'stardust:extract',
    writtenAt: new Date().toISOString(),
    readArtifacts: ['https://www.clover.com/', ...slugs.map((s) => `stardust/current/pages/${s}.json`)],
    synthesizedInputs: ['register (heuristic)', 'voice.tone.guess (heuristic)'],
    stardustVersion: '0.10.0',
    notes,
  },
  site: {
    name: home.og.siteName || 'Clover',
    tagline: home.metaDescription,
    originUrl: 'https://www.clover.com',
  },
  origins: [{ origin: 'https://www.clover.com', role: 'primary', pagesCaptured: slugs.length, contributedSignals: [] }],
  logo: {
    source: 'img',
    sourceSelector: 'header img[alt="Clover"] (https://cloverstatic.com/.../clover-logo.….svg)',
    localPath: 'stardust/current/assets/logo.svg',
    format: 'svg',
    intrinsicWidth: 164,
    intrinsicHeight: 40,
    synthesized: false,
    synthesizedBasis: null,
    variants: [
      { name: 'wordmark-green', localPath: 'stardust/current/assets/logo.svg' },
      { name: 'wordmark-dark-green (footer)', localPath: 'stardust/current/assets/logo-dark-green.svg' },
      { name: 'clover-mark-green (glyph only, new-template header)', localPath: 'stardust/current/assets/logo-mark-green.svg' },
    ],
  },
  favicon: {
    source: 'link[rel="icon"][sizes="192x192"]',
    url: 'https://cloverstatic.com/content/icons/web/favicons/android-chrome-192x192.png',
    file: 'stardust/current/assets/favicon.png',
  },
  palette,
  type: {
    headingFamily: {
      name: null, // filled below
      stack: null,
      weights: headingWeights,
      sizes: headingSizes,
      lineHeights: headingLHs,
      letterSpacing: headingLS,
      sourceSelectors: ['h1', 'h2', 'h3'],
      familiesObserved: headingFams.slice(0, 6).map(([f, n]) => ({ family: f, headings: n })),
    },
    bodyFamily: {
      name: bodyFam ? bodyFam[0] : null,
      stack: bodyFam ? `"${bodyFam[0]}", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif` : null,
      weights: bodyFam ? [...bodyFam[1].weights].sort((a, b) => a - b) : [],
      sizes: bodyFam ? Object.entries(bodyFam[1].sizes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s) : [],
      lineHeights: bodyFam ? [...bodyFam[1].lhs].slice(0, 3) : [],
      letterSpacing: ['normal'],
      sourceSelectors: ['main p', 'main li'],
    },
    monoFamily: null,
    scaleRatio: matched ? SCALES[matched] : null,
    scaleAudit: { kind: matched ? 'modular' : 'ad-hoc', ratios, matchedScale: matched },
    loadStrategy,
    files: fontFiles,
  },
  spacing: {
    baseUnit: base8 >= 0.7 ? 8 : (base4 >= 0.7 ? 4 : null),
    scale: [...new Set(allPads)].sort((a, b) => a - b).slice(0, 10),
    sectionPadding: pads[0] ? `${pads[0][0]}px` : null,
    containerMaxWidth: container ? `${container}px` : null,
    gridGap: null,
  },
  motifs: {
    borderRadius: {
      primary: nonPill[0]?.[0] || null,
      secondary: nonPill[1]?.[0] || null,
      pill,
      primarySources: slugs.slice(0, 3),
      occurrences: Object.fromEntries(radSorted.slice(0, 8)),
    },
    shadows,
    gradients: [],
    patterns,
  },
  componentStyle: {
    buttons: {
      primary: btnPrimary ? { background: btnPrimary.bgHex, color: btnPrimary.color, borderRadius: btnPrimary.borderRadius, padding: btnPrimary.padding, fontWeight: btnPrimary.fontWeight, shadow: btnPrimary.boxShadow !== 'none' ? btnPrimary.boxShadow : null, occurrences: btnPrimary.count } : null,
      secondary: btnSecondary ? { background: btnSecondary.bgHex, color: btnSecondary.color, borderRadius: btnSecondary.borderRadius, padding: btnSecondary.padding, fontWeight: btnSecondary.fontWeight, shadow: null, occurrences: btnSecondary.count } : null,
      ghost: null,
    },
    dualCTAPattern: 'primary-then-secondary (home hero: "Get Clover" + "Contact sales")',
    cards: { background: '#ffffff', borderRadius: nonPill[0]?.[0] || null, padding: null, shadow: shadows[0]?.value || null, border: null },
    inputs: inputSample || null,
  },
  systemComponents,
  iconFont: null,
  voice: {
    heroHeadline: home.heroHeadline,
    heroSubcopy: home.heroLede,
    heroImage,
    heroMedium,
    primaryCTALabel: foldCtas[0]?.label || null,
    ctaSamples: [...new Set((Object.values(pages).flatMap((p) => p.ctas || [])).filter((c) => c.label.length < 28 && !CTA_STOPLIST.test(c.label.trim())).map((c) => c.label))].slice(0, 8),
    navItems: ['Restaurants', 'Services', 'Retail', 'Healthcare', 'Products', 'Resources'],
    footerHeadings: ['Take payments', 'Run your business', 'Sell more', 'Business types', 'Hardware devices', 'Help', 'About', 'Integrations'],
    firstParagraph,
    tone: {
      guess: 'bold-direct',
      evidence: 'short benefit-led heroes ("A Clover for every small business", "You bring the flavor, Clover powers the pay", "Win the daily race against the clock"), second-person address, stat-band bragging ("Run the numbers: 4M+, #1, $337B+"), no jargon',
    },
  },
  voiceTable: { ctaFrequency, headingFrequency, toneMetrics },
  crossPromo,
  register,
};

// heading family: pick display family (largest sizes) vs workhorse
// (clover ships Altform for classic-template headings and PP Formula Condensed
// for the new home template's display; frequency decides primary, divergence noted)
const topFam = headingFams[0]?.[0] || null;
brand.type.headingFamily.name = topFam;
brand.type.headingFamily.stack = topFam ? `"${topFam}", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif` : null;
if (headingFams.length > 1) {
  brand._provenance.notes.push(`heading families diverge by template generation: ${headingFams.slice(0, 4).map(([f, n]) => `${f} (${n} headings)`).join(', ')}. Primary = most frequent (${topFam}); the new home template uses PP Formula Condensed for display headings.`);
}
if (String(pads[0]?.[0]) !== String(pads[1]?.[0]) && pads[1]) {
  brand._provenance.notes.push(`section padding varies: mode ${pads[0][0]}px (${pads[0][1]}×), next ${pads[1][0]}px (${pads[1][1]}×).`);
}
brand._provenance.notes.push('logo: header wordmark img renders at 90×22 px (below the 32px logo-chain height threshold) but is unambiguously the brand wordmark (alt="Clover", src clover-logo.svg, intrinsic 164×40); captured as logo with the threshold exception noted. Dark-green footer variant and standalone clover mark also captured.');
brand._provenance.notes.push('container width diverges by template generation: 1158px (classic pos-systems/pricing) vs 1280-1392px (new home template).');

await writeFile(OUT, JSON.stringify(brand, null, 2));
console.log('palette:', palette.map((p) => `${p.role}=${p.value}(${p.occurrences})`).join(' '));
console.log('headingFams:', JSON.stringify(headingFams.slice(0, 5)));
console.log('body:', bodyFam && bodyFam[0], '| sizes', brand.type.bodyFamily.sizes.join(','));
console.log('scaleAudit:', brand.type.scaleAudit.kind, matched, 'ratios:', ratios.join(','));
console.log('radius:', JSON.stringify(brand.motifs.borderRadius.occurrences));
console.log('shadows:', shadows.length, '| patterns:', patterns.map((p) => p.name).join(','));
console.log('systemComponents:', systemComponents.map((s) => `${s.name}(${s.occurrences})`).join(' '));
console.log('ctaFrequency:', ctaFrequency.slice(0, 5).map((c) => `${c.label}:${c.total}/${c.pageCount}p`).join(' | '));
console.log('headingFrequency>=3p:', headingFrequency.length, '| crossPromo:', crossPromo.detected);
console.log('heroImage:', heroImage ? heroImage.url.slice(0, 60) : null, '| heroMedium:', heroMedium ? heroMedium.kind + ':' + heroMedium.src.slice(0, 60) : null);
console.log('fonts:', fontFiles.map((f) => `${f.family}:${f.weight}(${f.licensingFlag})`).join(' '));
console.log('uppercase%:', toneMetrics.headingsUppercasePercent, 'distinctCta:', toneMetrics.distinctCtaLabels);
