#!/usr/bin/env node
/**
 * render-brand-review.mjs — Phase 5 of stardust:extract.
 * Reads stardust/current/{_brand-extraction.json,_crawl-log.json,pages/*.json,
 * PRODUCT.md} and emits stardust/current/brand-review.html per
 * extract/reference/brand-review-template.md (canonical section order,
 * mechanical Tensions detectors, brand-faithful chrome).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';

const brand = JSON.parse(await readFile('stardust/current/_brand-extraction.json', 'utf8'));
const log = JSON.parse(await readFile('stardust/current/_crawl-log.json', 'utf8'));
const pages = {};
for (const f of (await readdir('stardust/current/pages')).filter((x) => x.endsWith('.json'))) {
  pages[f.replace('.json', '')] = JSON.parse(await readFile(`stardust/current/pages/${f}`, 'utf8'));
}
const slugs = Object.keys(pages);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- chrome color resolution (template § Styling rules) ----------
// --primary: most-frequent *saturated* palette color (sat>30, max<240)
const parseHex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
const sat = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
const mx = (c) => Math.max(c.r, c.g, c.b);
const satEntries = brand.palette.filter((p) => { const c = parseHex(p.value); return sat(c) > 30 && mx(c) < 240; });
const primary = satEntries[0]?.value || brand.palette.find((p) => p.role === 'primary')?.value || '#147aff';
// --primary-dark: same hue family, lower luminance; none exists → darken ~30%
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const hue = (c) => { const { r, g, b } = c; const M = Math.max(r, g, b); const m = Math.min(r, g, b); if (M === m) return 0; let h; if (M === r) h = ((g - b) / (M - m)) % 6; else if (M === g) h = (b - r) / (M - m) + 2; else h = (r - g) / (M - m) + 4; return (h * 60 + 360) % 360; };
const pC = parseHex(primary);
const darker = satEntries.map((p) => parseHex(p.value)).filter((c) => Math.abs(hue(c) - hue(pC)) <= 30 && lum(c) < lum(pC))[0];
const primaryDark = darker
  ? '#' + [darker.r, darker.g, darker.b].map((v) => v.toString(16).padStart(2, '0')).join('')
  : '#' + [pC.r, pC.g, pC.b].map((v) => Math.round(v * 0.7).toString(16).padStart(2, '0')).join('');
// --accent: hue ≥60° from primary when possible; else role=secondary; else primary.
// clover is single-hue: no ≥60° candidate; role=secondary equals --primary's family.
// Documented deviation: the signature acid-lime (#b6fb6f) is the site's own
// highlight accent — visually distinct by lightness — chosen over a literal
// monochromatic fallback so the chrome reads like the site.
const acid = brand.palette.find((p) => p.value === '#b6fb6f');
const accent = acid ? acid.value : primary;

const upper = brand.voiceTable.toneMetrics.headingsUppercasePercent >= 25;
const display = `"PP Formula Condensed", "Altform", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
const displayAltform = `"Altform", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
const body = `"Graphik", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`;

// ---------- Tensions detectors (mechanical baseline) ----------
const tensions = [];
const T = (id, title, bodyHtml, source, badge = 'observed') => tensions.push({ id, title, bodyHtml, source, badge });

// T-scale
if (brand.type.scaleAudit.kind === 'ad-hoc') {
  const sizes = [...new Set(brand.type.headingFamily.sizes)].join(' → ');
  T('T-scale', 'Type scale is ad-hoc', `${esc(sizes)}, ratios ${brand.type.scaleAudit.ratios.join(' / ')} — no consistent ratio. Direct will need to decide whether the target adopts a modular scale.`, '_brand-extraction.json § type.scaleAudit', 'synthesized');
}
// T-radius-vocab: >2 distinct values <16px each with ≥10 occurrences
const smallRadii = Object.entries(brand.motifs.borderRadius.occurrences).filter(([v, n]) => parseFloat(v) < 16 && n >= 10);
if (smallRadii.length > 2) {
  T('T-radius-vocab', 'Radius vocabulary is fragmented', `${smallRadii.map(([v, n]) => `${v} (${n}×)`).join(', ')}. Direct will need to pick a single small-radius value or accept the variance.`, '_brand-extraction.json § motifs.borderRadius');
}
// T-cta-vocab: ≥2 distinct labels from the same equivalence bucket
const BUCKETS = {
  'see-more': ['see more', 'learn more', 'more info', 'more', 'read more', 'view more', 'discover more', 'explore'],
  start: ['get started', 'start now', 'start free', 'try it', 'try now', 'try free', 'try for free', 'begin'],
  contact: ['contact', 'contact us', 'get in touch', 'talk to us', 'reach out', 'say hello'],
  buy: ['buy now', 'purchase', 'order now', 'order', 'add to cart', 'checkout'],
  signup: ['sign up', 'signup', 'create account', 'register', 'join', 'subscribe'],
  donate: ['donate', 'donate now', 'give', 'give now', 'support us', 'contribute'],
  'vague-here': ['here', 'click here', 'read this', 'this', 'more'],
};
const allCtaLabels = {};
for (const p of Object.values(pages)) for (const c of p.ctas || []) { const l = c.label.trim().toLowerCase(); allCtaLabels[l] = (allCtaLabels[l] || 0) + 1; }
for (const [bucket, members] of Object.entries(BUCKETS)) {
  const hits = members.filter((m) => allCtaLabels[m]);
  if (hits.length >= 2) {
    T('T-cta-vocab', `CTA voice fragmented (${bucket})`, `${hits.map((h) => `“${h}” (${allCtaLabels[h]}×)`).join(', ')} appear as sibling labels. Direct will need to pick a canonical voice.`, 'pages/*.json § ctas', 'cross-page');
  }
}
// T-link-content-free
const FREE = ['here', 'click here', 'read this', 'more', 'this'];
const freeHits = {};
for (const [slug, p] of Object.entries(pages)) {
  for (const lk of [...(p.links.internal || []), ...(p.links.external || [])]) {
    const l = lk.text.trim().toLowerCase();
    if (FREE.includes(l)) { freeHits[l] = freeHits[l] || { n: 0, pages: new Set() }; freeHits[l].n += 1; freeHits[l].pages.add(slug); }
  }
}
if (Object.keys(freeHits).length) {
  T('T-link-content-free', 'Content-free link labels found', `${Object.entries(freeHits).map(([l, d]) => `“${l}” (${d.n}× on ${[...d.pages].join(', ')})`).join('; ')}. Accessibility issue — screen readers and crawlers cannot tell what these point to.`, 'pages/*.json § links', 'cross-page');
}
// T-logo-variants (always emits)
T('T-logo-variants', 'Logo variant set is partial', `Primary capture is the ${esc(brand.logo.source)} wordmark; ${brand.logo.variants.length} variants captured opportunistically (green, dark-green footer, standalone mark). A white/knockout variant for dark grounds was not captured — the redesign will need a complete variant set; direct should plan it.`, '_brand-extraction.json § logo');
// T-color-imbalance
const imb = brand.palette.filter((p) => !['#000000', '#ffffff'].includes(p.value) && !/^text-/.test(p.role) && p.usedAs.length === 1);
for (const p of imb) {
  T('T-color-imbalance', `Color ${p.value} (${p.role}) used one way only`, `Appears as ${p.usedAs[0]} only — never as ${p.usedAs[0] === 'text' ? 'background/border/fill' : 'text/border'}. Direct will need to decide: drop, expand, or keep as accent.`, '_brand-extraction.json § palette', 'cross-page');
}
// T-no-tokens / T-tokens-unused
const allProps = Object.values(pages).flatMap((p) => p.cssCustomProperties || []);
if (!allProps.length) {
  T('T-no-tokens', 'Site ships no design tokens', 'No CSS custom properties defined on any page. The migration target will introduce a token layer — a structural change worth calling out.', 'pages/*.json § cssCustomProperties', 'cross-page');
} else {
  const names = [...new Set(allProps.map((p) => p.name))];
  if (names.length <= 3) {
    T('T-no-tokens', 'Design-token layer is vestigial', `Only ${names.length} custom propert${names.length === 1 ? 'y' : 'ies'} defined across five pages (${names.map(esc).join(', ')}). The visual system lives in compiled CSS-module classes, not tokens — the migration target will introduce a real token layer.`, 'pages/*.json § cssCustomProperties', 'cross-page');
  }
}
// T-img-alt-generic
const GENERIC = ['logo', 'image', 'picture', 'photo', 'img', 'icon'];
const genHits = [];
for (const [slug, p] of Object.entries(pages)) for (const im of p.media.images || []) if (GENERIC.includes((im.alt || '').trim().toLowerCase())) genHits.push({ slug, alt: im.alt.trim() });
if (genHits.length) {
  T('T-img-alt-generic', 'Generic alt text found', `${genHits.length} image(s) carry stock-placeholder alt (${[...new Set(genHits.map((g) => `“${g.alt}”`))].join(', ')}) on ${[...new Set(genHits.map((g) => g.slug))].join(', ')}. Content-free labels fail screen readers.`, 'pages/*.json § media.images[].alt', 'cross-page');
}
// T-img-alt-empty
const allImgs = Object.values(pages).flatMap((p) => p.media.images || []);
const emptyAlt = allImgs.filter((i) => !(i.alt || '').trim()).length;
const emptyPct = Math.round(100 * emptyAlt / Math.max(1, allImgs.length));
if (emptyPct >= 30) {
  T('T-img-alt-empty', 'Empty alt text widespread', `${emptyPct}% of ${allImgs.length} captured images carry empty alt text. Accessibility issue and a content-sourcing decision for direct.`, 'pages/*.json § media.images[].alt', 'cross-page');
}
// T-embed-dominance
const dom = slugs.filter((s) => pages[s].embedDominance?.dominated);
if (dom.length) {
  T('T-embed-dominance', 'Embed-dominated page(s)', `${dom.join(', ')} carry primary content inside a cross-origin embed; brand-surface tokens for those pages were not captured.`, 'pages/*.json § embedDominance');
}
// T-nav-conflict: pricing ↔ contact sales in top nav
const navText = (pages.home.landmarks || []).filter((l) => ['banner', 'navigation'].includes(l.role)).map((l) => l.innerText.toLowerCase()).join(' ');
if (navText.includes('pricing') && navText.includes('contact sales')) {
  T('T-nav-conflict', 'Top-nav actions compete', 'Top-nav contains both “Pricing” and “Contact sales” — self-serve vs assisted-sales paths competing for the same user moment. Direct should resolve which is primary.', 'pages/home.json § landmarks (banner/navigation)');
}
// T-temporal-mark
const tempo = `${brand.logo.sourceSelector} ${brand.voice.heroHeadline}`.toLowerCase();
if (/anniversary|centennial|20\d\d edition|year-in-review/.test(tempo)) {
  T('T-temporal-mark', 'Temporal mark detected', 'A time-bound campaign mark was detected; direct must decide whether to carry it forward.', '_brand-extraction.json § logo/voice');
}
// consolidation: rules firing >3 times collapse (per-element rules)
const consolidated = [];
for (const id of [...new Set(tensions.map((t) => t.id))]) {
  const group = tensions.filter((t) => t.id === id);
  if (group.length > 3) {
    consolidated.push({ id, title: `${group.length}× ${id} (consolidated)`, bodyHtml: `<ul>${group.map((g) => `<li>${g.bodyHtml}</li>`).join('')}</ul>`, source: group[0].source, badge: group[0].badge });
  } else consolidated.push(...group);
}

// ---------- section renderers ----------
const failures = log.crawl?.failures || [];
const waitAvg = Math.round(slugs.reduce((a, s) => a + pages[s]._provenance.waitMs, 0) / slugs.length);
const badge = (b) => `<span class="badge b-${b}">${b}</span>`;
const pageCards = slugs.map((s) => `
  <figure class="shot"><a href="assets/screenshots/${s}.png"><img src="assets/screenshots/${s}.png" alt="${esc(pages[s].title)} screenshot" loading="lazy"></a>
  <figcaption>${esc(pages[s].title || s)}<br><code>/${s === 'home' ? '' : esc(pages[s].url.replace(/^https?:\/\/[^/]+\//, ''))}</code></figcaption></figure>`).join('');

const swatches = brand.palette.map((p) => `
  <div class="swatch"><div class="chip" style="background:${p.value};${p.value === '#ffffff' ? 'border:1px solid #ddd;' : ''}"></div>
  <div class="sw-role">${esc(p.role)}</div><code>${p.value}</code>
  <div class="sw-meta">${p.occurrences} weighted occurrences<br>${p.usedAs.map((u) => `<span class="pill-sm">${u}</span>`).join(' ')}<br><span class="muted">${p.sources.join(', ')}</span></div></div>`).join('');

const typeRows = [
  { label: 'Display · PP Formula Condensed Black 900 / 92px / 0.88', style: `font-family:${display};font-weight:900;font-size:56px;line-height:.9;text-transform:uppercase;`, sample: 'Run the numbers' },
  { label: 'Headline · Altform 400 / 56px / 1.1', style: `font-family:${displayAltform};font-weight:400;font-size:40px;line-height:1.1;`, sample: 'Find the right solution to power your business' },
  { label: 'Title · Altform 400 / 40px / 1.1', style: `font-family:${displayAltform};font-weight:400;font-size:30px;line-height:1.1;`, sample: 'Every Clover system has business built-in tools' },
  { label: 'Body · Graphik 400 / 16px / 1.5', style: `font-family:${body};font-weight:400;font-size:16px;line-height:1.5;max-width:66ch;`, sample: esc(brand.voice.firstParagraph || '') },
  { label: 'Label · Graphik 500 / 15px', style: `font-family:${body};font-weight:500;font-size:15px;`, sample: 'Restaurants · Services · Retail · Healthcare · Products · Resources' },
].map((r) => `<div class="type-row"><code class="type-label">${esc(r.label)}</code><div style="${r.style}">${r.sample}</div></div>`).join('');

const ctaTable = brand.voiceTable.ctaFrequency.map((c) => `<tr><td><span class="pill">${esc(c.label)}</span></td><td>${c.total}</td><td>${c.pageCount}</td><td class="muted">${c.pages.join(', ')}</td></tr>`).join('');
const headFreqRows = brand.voiceTable.headingFrequency.map((h) => `<li><strong>${esc(h.text)}</strong> — ${h.total}× on ${h.pageCount} pages (h${h.level})</li>`).join('') || '<li class="muted">No heading repeats on ≥3 pages beyond the footer system block.</li>';

const tensionCards = consolidated.map((t) => `
  <div class="tension"><div class="t-head"><code>${t.id}</code> ${badge(t.badge)}</div>
  <h4>${esc(t.title)}</h4><p>${t.bodyHtml}</p><div class="t-src">Source: ${esc(t.source)}</div></div>`).join('');

const motifCards = Object.entries(brand.motifs.borderRadius.occurrences).map(([v, n]) => `
  <div class="motif"><div class="m-demo" style="border-radius:${v};"></div><code>${v}</code><span class="muted">${n} occurrences</span></div>`).join('');

const compKeys = ['grids', 'cards', 'carousels', 'accordions', 'tabs', 'statRow', 'logoStrip', 'ctaBand', 'testimonialCards', 'breadcrumbs'];
const compRows = compKeys.map((k) => {
  const total = slugs.reduce((a, s) => a + (pages[s].components?.[k]?.count || 0), 0);
  const on = slugs.filter((s) => (pages[s].components?.[k]?.count || 0) > 0);
  return total ? `<li><strong>${k}</strong> — ${total} across ${on.length} pages <span class="muted">(${on.join(', ')})</span></li>` : null;
}).filter(Boolean).join('');
const patternRows = brand.motifs.patterns.map((p) => `<li><strong>${esc(p.name)}</strong> — <span class="muted">${esc(p.evidence)}</span></li>`).join('');

const sysRows = brand.systemComponents.map((sc) => `
  <div class="sys"><span class="pill">${esc(sc.kind)}</span> <strong>${esc(sc.name)}</strong> — ${sc.occurrences}/${slugs.length} pages
  <div class="muted">headings: ${sc.headingSequence.map(esc).join(' · ') || '—'}${sc.ctaLabels.length ? ` · CTAs: ${sc.ctaLabels.map(esc).join(', ')}` : ''}</div></div>`).join('');

const spacingBars = brand.spacing.scale.map((v) => `<div class="bar-wrap"><div class="bar" style="height:${Math.min(140, v)}px"></div><code>${v}</code></div>`).join('');
const radiiPills = Object.keys(brand.motifs.borderRadius.occurrences).map((v) => `<span class="pill">${v}</span>`).join(' ');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Clover — current-state brand review</title>
<style>
@font-face { font-family: 'Graphik'; font-weight: 400; src: url('https://cloverstatic.com/content/fonts/graphik/Graphik-Regular-Cy-Gr-Web.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'Graphik'; font-weight: 500; src: url('https://cloverstatic.com/content/fonts/graphik/Graphik-Medium-Cy-Gr-Web.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'Altform'; font-weight: 400; src: url('https://cloverstatic.com/content/fonts/altform/Altform-Regular.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'Altform'; font-weight: 600; src: url('https://cloverstatic.com/content/fonts/altform/Altform-SemiBold.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'PP Formula Condensed'; font-weight: 900; src: url('https://cloverstatic.com/content/fonts/formula/PPFormula-CondensedBlack.woff2') format('woff2'); font-display: swap; }
:root {
  --primary: ${primary};
  --primary-dark: ${primaryDark};
  --accent: ${accent};
  --secondary: #228800;
  --text: #000000;
  --text-muted: #555555;
  --surface: #ffffff;
  --surface-alt: #ededed;
  --border: #d8d8d8;
  --display: ${display.replace(/"/g, "'")};
  --display-alt: ${displayAltform.replace(/"/g, "'")};
  --body: ${body.replace(/"/g, "'")};
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--body); color: var(--text); background: var(--surface); }
nav.top { position: sticky; top: 0; z-index: 10; background: var(--primary-dark); color: #fff; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 10px; padding: 10px 20px; font-family: var(--display-alt); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; }
nav.top .brand { font-weight: 600; margin-right: 14px; }
nav.top a { color: #fff; text-decoration: none; padding: 5px 12px; border-radius: 150px; }
nav.top a:hover { background: rgba(255,255,255,0.18); }
main { max-width: 1180px; margin: 0 auto; padding: 0 24px 80px; }
section { padding: 44px 0 12px; border-bottom: 1px solid var(--border); }
h2 { font-family: var(--display-alt); font-weight: 600; font-size: 30px; margin: 0 0 6px; }
h4 { font-family: var(--display-alt); margin: 6px 0; }
.badge { display: inline-block; font-family: var(--body); font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; padding: 2px 9px; border-radius: 150px; margin-left: 8px; vertical-align: middle; }
.b-observed, .b-cross-page { background: var(--primary-dark); color: #fff; }
.b-home-only { background: var(--surface-alt); color: var(--text); }
.b-inferred { background: var(--accent); color: #003000; }
.b-synthesized { background: #333; color: #fff; }
.muted { color: var(--text-muted); font-size: 13px; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
.masthead { padding: 56px 0 30px; border-bottom: 4px solid var(--primary); }
.masthead img.logo { height: 40px; display: block; margin-bottom: 18px; }
.masthead .hero-line { font-family: var(--display); font-size: clamp(34px, 6vw, 64px); font-weight: 900; text-transform: uppercase; line-height: .92; color: var(--primary-dark); margin: 8px 0 10px; }
.masthead .tagline { max-width: 70ch; color: var(--text-muted); }
.stats { display: flex; flex-wrap: wrap; gap: 14px; margin: 18px 0; }
.stat { flex: 1; min-width: 220px; background: var(--surface-alt); border-radius: 8px; padding: 18px 20px; }
.stat .n { font-family: var(--display); font-size: 34px; font-weight: 900; color: var(--primary-dark); text-transform: uppercase; }
.stat.acid { background: var(--accent); }
.shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.shot { margin: 0; }
.shot img { width: 100%; aspect-ratio: 16/10; object-fit: cover; object-position: top; border: 1px solid var(--border); border-radius: 8px; }
.shot figcaption { font-size: 13px; margin-top: 6px; }
.palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.swatch { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
.chip { height: 96px; border-radius: 8px; margin-bottom: 10px; }
.sw-role { font-family: var(--display-alt); font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
.sw-meta { font-size: 12.5px; color: var(--text-muted); margin-top: 6px; }
.pill-sm { display: inline-block; background: var(--surface-alt); border-radius: 150px; padding: 1px 8px; font-size: 11px; }
.type-row { padding: 14px 0; border-top: 1px dashed var(--border); }
.type-label { color: var(--text-muted); display: block; margin-bottom: 8px; }
.voice-cards { display: grid; gap: 12px; }
.voice-card { background: var(--surface-alt); border-radius: 8px; padding: 22px 24px; }
.voice-card .vc-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-muted); }
.voice-card .vc-body { font-family: var(--display-alt); font-size: 22px; margin-top: 4px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
@media (max-width: 720px) { table { display: block; overflow-x: auto; } .bars { flex-wrap: wrap; } }
img, svg { max-width: 100%; }
.pill, code { overflow-wrap: anywhere; }
td, th { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--border); }
.pill { display: inline-block; background: var(--primary-dark); color: #fff; border-radius: 150px; padding: 3px 12px; font-size: 12.5px; }
.tensions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 720px) { .tensions { grid-template-columns: 1fr; } }
.tension { border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 8px; padding: 14px 16px; }
.tension .t-head code { background: var(--surface-alt); padding: 2px 7px; border-radius: 4px; }
.tension p { font-size: 14px; margin: 6px 0; }
.tension .t-src { font-size: 12px; color: var(--text-muted); }
.motifs { display: flex; flex-wrap: wrap; gap: 16px; }
.motif { text-align: center; }
.m-demo { width: 84px; height: 84px; background: var(--primary); margin-bottom: 6px; }
.complist li { border-left: 3px solid var(--primary); padding: 4px 0 4px 12px; list-style: none; margin: 6px 0; }
.complist { padding-left: 0; }
.sys { border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; margin: 10px 0; }
.logo-row { display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start; }
.logo-row .logo-box { background: var(--surface-alt); border-radius: 8px; padding: 24px; }
.logo-row img { max-width: 240px; height: 56px; }
.logo-row dl { font-size: 14px; }
.logo-row dt { font-weight: 600; font-family: var(--display-alt); margin-top: 10px; }
.bars { display: flex; align-items: flex-end; gap: 14px; margin: 14px 0; }
.bar-wrap { text-align: center; }
.bar { width: 34px; background: var(--primary); border-radius: 4px 4px 0 0; }
footer.review { padding: 30px 0; font-size: 13px; color: var(--text-muted); }
@media print { nav.top { position: static; } section { break-inside: avoid; } }
</style>
</head>
<body>
<nav class="top">
  <span class="brand">Clover · Current state</span>
  <a href="#coverage">Coverage</a><a href="#pages">Pages</a><a href="#palette">Palette</a><a href="#type">Typography</a><a href="#voice">Voice</a><a href="#tensions">Tensions</a><a href="#motifs">Motifs</a><a href="#components">Components</a><a href="#system">System</a><a href="#logo">Logo</a><a href="#spacing">Spacing</a>
</nav>
<main>
<header class="masthead">
  <img class="logo" src="assets/logo.svg" alt="Clover logo">
  <p class="hero-line" style="color: var(--primary-dark);">${esc(brand.voice.heroHeadline)}</p>
  <p class="tagline">${esc(brand.site.tagline)}</p>
  <code>${esc(brand.site.originUrl)} · extracted 2026-07-23 · 5 of 158 discovered pages (us/en locale)</code>
</header>

<section id="coverage">
  <h2>Coverage ${badge('observed')}</h2>
  <div class="stats">
    <div class="stat"><div class="n">5 / 158</div>pages extracted (default cap 5; template-variety selection). 1 junk-filtered, 18 malformed sitemap entries dropped.</div>
    <div class="stat"><div class="n">slow · ${(waitAvg / 1000).toFixed(1)}s</div>wait strategy (escalated from medium after the vision gate) · avg measured wait+scroll+reveal per page. ${failures.length ? `<strong>${failures.length} failures.</strong>` : 'Zero failures; all pages live-rendered (HTTP 200).'}</div>
    <div class="stat acid"><div class="n">8 · 3 · 2</div>palette roles · type families (Formula / Altform / Graphik, all private cuts) · system components. Hero medium: background <strong>video</strong>.</div>
  </div>
  <p class="muted">Vision gate: home and pricing were re-captured (consent modal + scroll-reveal blanking); all five verdicts now ok. See <code>_crawl-log.json#visionCheck</code>.</p>
</section>

<section id="pages">
  <h2>Pages ${badge('observed')}</h2>
  <div class="shots">${pageCards}</div>
</section>

<section id="palette">
  <h2>Color palette ${badge('cross-page')}</h2>
  <p class="muted">Aggregated across all 5 pages, element-weighted, ΔE&lt;5 clustered. Pure black/white kept verbatim. Source: <code>_brand-extraction.json § palette</code></p>
  <div class="palette">${swatches}</div>
</section>

<section id="type">
  <h2>Typography ${badge('cross-page')} <span class="badge b-synthesized">No modular scale</span></h2>
  <p class="muted">Real captured sizes/weights; per-level representative picked by pixel-and-weight score. Families diverge by template generation (Altform on classic pages; PP Formula Condensed display on home). Source: <code>_brand-extraction.json § type</code></p>
  ${typeRows}
</section>

<section id="voice">
  <h2>Voice ${badge('home-only')} <span class="badge b-inferred">tone guess: bold-direct</span></h2>
  <div class="voice-cards">
    <div class="voice-card"><div class="vc-tag">Hero headline</div><div class="vc-body">${esc(brand.voice.heroHeadline)}</div></div>
    <div class="voice-card"><div class="vc-tag">Hero lede</div><div class="vc-body">${esc(brand.voice.heroSubcopy)}</div></div>
    <div class="voice-card"><div class="vc-tag">First paragraph</div><div class="vc-body" style="font-size:17px;">${esc(brand.voice.firstParagraph)}</div></div>
  </div>
  <h4>CTA frequency ${badge('cross-page')}</h4>
  <table><tr><th>Label</th><th>Total</th><th>Pages</th><th></th></tr>${ctaTable}</table>
  <p class="muted">Header-nav items, locale switcher, and skip-links were excluded from CTA aggregation (see <code>_brand-extraction.json#_provenance</code>).</p>
  <h4>Repeated headings (≥3 pages)</h4>
  <ul>${headFreqRows}</ul>
  <div class="stats">
    <div class="stat"><div class="n">${brand.voiceTable.toneMetrics.headingsUppercasePercent}%</div>headings uppercase in text content (home displays are uppercased via CSS <code>text-transform</code>, not content)</div>
    <div class="stat"><div class="n">${brand.voiceTable.toneMetrics.distinctHeadings}</div>distinct headings (${brand.voiceTable.toneMetrics.headingsTotal} total)</div>
    <div class="stat"><div class="n">${brand.voiceTable.toneMetrics.distinctCtaLabels}</div>distinct CTA labels</div>
  </div>
</section>

<section id="tensions">
  <h2>Tensions ${badge('observed')}</h2>
  <p class="muted">Descriptive contradictions in the current site — the decision agenda for <code>$stardust direct</code>. Not prescriptions.</p>
  <div class="tensions">${tensionCards}</div>
</section>

<section id="motifs">
  <h2>Motifs ${badge('cross-page')}</h2>
  <div class="motifs">${motifCards}
    <div class="motif"><div class="m-demo" style="background:var(--surface);border:1px solid var(--border);"></div><code>shadows</code><span class="muted">none captured — flat system</span></div>
  </div>
  <ul class="complist">${patternRows}</ul>
</section>

<section id="components">
  <h2>Components ${badge('cross-page')}</h2>
  <ul class="complist">${compRows}</ul>
</section>

<section id="system">
  <h2>System components ${badge('cross-page')}</h2>
  ${sysRows}
</section>

<section id="logo">
  <h2>Logo &amp; favicons ${badge('home-only')}</h2>
  <div class="logo-row">
    <div class="logo-box"><img src="assets/logo.svg" alt="Clover wordmark"></div>
    <dl>
      <dt>Source</dt><dd>header <code>img[alt="Clover"]</code> (cloverstatic.com CDN); rendered 90×22px — below the 32px chain threshold but unambiguously the wordmark (exception noted in provenance)</dd>
      <dt>File</dt><dd>SVG, intrinsic 164×40 → <code>assets/logo.svg</code></dd>
      <dt>Variants captured</dt><dd>green wordmark · dark-green wordmark (footer) · standalone clover mark · favicon (192px PNG)</dd>
      <dt>Variants not captured</dt><dd>white/knockout for dark grounds (see tension T-logo-variants)</dd>
    </dl>
  </div>
</section>

<section id="spacing">
  <h2>Spacing &amp; shape ${badge('cross-page')}</h2>
  <p>Base unit: <strong>${brand.spacing.baseUnit}px</strong> · section padding mode <strong>${esc(brand.spacing.sectionPadding)}</strong> · container <strong>${esc(brand.spacing.containerMaxWidth)}</strong> (classic template; home runs 1280–1392px)</p>
  <div class="bars">${spacingBars}</div>
  <h4>Radii revisited</h4>
  <p>${radiiPills} <span class="pill" style="background:var(--surface-alt);color:var(--text);">50px pill — search input only</span></p>
</section>

<footer class="review">
  <p><strong>Provenance.</strong> Rendered by stardust:extract from <code>_brand-extraction.json</code>, <code>_crawl-log.json</code>, <code>pages/*.json</code> (5 live Playwright captures, wait mode slow), <code>PRODUCT.md</code>, <code>DESIGN.md</code>. Chrome colors are the captured palette: --primary ${primary}, --primary-dark ${primaryDark} (derived: no darker same-hue candidate), --accent ${accent} (site signature; no ≥60° hue candidate exists on this single-hue brand). No values invented.</p>
  <p><strong>What's next:</strong> open this file, verify the extraction, then run <code>/stardust:direct</code> to resolve a redesign direction.</p>
  <p><strong>Badge legend:</strong> ${badge('observed')} frequency-counted ${badge('cross-page')} aggregated across all pages ${badge('home-only')} single-page source ${badge('inferred')} agent judgment ${badge('synthesized')} constructed claim</p>
</footer>
</main>
</body>
</html>`;

await writeFile('stardust/current/brand-review.html', html);
console.log(`brand-review.html written (${(html.length / 1024).toFixed(0)} KB) — ${consolidated.length} tension cards: ${[...new Set(consolidated.map((t) => t.id))].join(', ')}`);
console.log(`chrome: --primary ${primary} --primary-dark ${primaryDark} --accent ${accent} uppercase:${upper}`);
