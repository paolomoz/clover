// Gap-fill: per-section media + copy inventory from the live interior pages.
// Downloads images missing from stardust/current/assets/media/.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const targets = [
  { slug: 'pos-systems', url: 'https://www.clover.com/pos-systems' },
  { slug: 'pos-solutions__restaurant', url: 'https://www.clover.com/pos-solutions/restaurant' },
  { slug: 'pricing', url: 'https://www.clover.com/pricing' },
  { slug: 'contact', url: 'https://www.clover.com/contact' },
];

const mediaDir = 'stardust/current/assets/media';
const existing = new Set(fs.readdirSync(mediaDir).map(f => f.toLowerCase()));
const nameFor = (url) => {
  try {
    const base = decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base.length > 4 ? base : null;
  } catch { return null; }
};
// crude match: an asset is "present" if a local file contains the url basename's stem
const stemPresent = (url) => {
  const n = nameFor(url); if (!n) return false;
  const stem = n.replace(/\.(png|jpe?g|webp|svg|gif|avif)$/i, '').toLowerCase().slice(0, 28);
  if (!stem || stem.length < 6) return false;
  for (const f of existing) if (f.includes(stem)) return true;
  return false;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const out = {};

for (const t of targets) {
  await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  for (const label of ['Accept', 'Accept all', 'I agree', 'OK']) {
    const btn = page.getByRole('button', { name: label, exact: false }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); break; }
  }
  // scroll through to trigger lazy loads
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(1500);

  const sections = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('main section, main > article > section')];
    const uniq = secs.filter(s => !secs.some(o => o !== s && o.contains(s)));
    return uniq.map((s, i) => {
      const h = s.querySelector('h1,h2,h3,h4,h5');
      const cs = getComputedStyle(s);
      const imgs = [...s.querySelectorAll('img')].map(im => ({ src: im.currentSrc || im.src, alt: im.alt, w: im.naturalWidth, h: im.naturalHeight }));
      const bgs = [];
      for (const el of [s, ...s.querySelectorAll('*')]) {
        const b = getComputedStyle(el).backgroundImage;
        const m = b && b.match(/url\("?([^")]+)"?\)/);
        if (m && !m[1].startsWith('data:')) bgs.push(m[1]);
      }
      // deepest solid bg on the section itself
      let bg = cs.backgroundColor;
      const eyebrow = s.querySelector('[class*="eyebrow"],[class*="Eyebrow"],[class*="kicker"]');
      return {
        i,
        cls: (s.className || '').toString().slice(0, 90),
        heading: h ? h.innerText.trim().slice(0, 90) : null,
        bg,
        eyebrow: eyebrow ? eyebrow.innerText.trim().slice(0, 50) : null,
        text: s.innerText.replace(/\s+/g, ' ').trim().slice(0, 900),
        imgs: imgs.slice(0, 15),
        cssBgs: [...new Set(bgs)].slice(0, 10),
      };
    });
  });
  out[t.slug] = { url: t.url, fetchedAt: new Date().toISOString(), renderedBy: 'playwright', sections };
  console.log('==', t.slug, sections.length, 'sections');
}

// download missing
const downloads = [];
for (const [slug, rec] of Object.entries(out)) {
  for (const s of rec.sections) {
    for (const u of [...s.imgs.map(x => x.src), ...s.cssBgs]) {
      if (!u || !u.startsWith('http')) continue;
      if (stemPresent(u)) continue;
      const n = nameFor(u); if (!n) continue;
      const dest = path.join(mediaDir, n);
      if (fs.existsSync(dest)) continue;
      try {
        const r = await fetch(u.split('?')[0]);
        if (!r.ok) { console.log('SKIP', r.status, n); continue; }
        fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
        existing.add(n.toLowerCase());
        downloads.push({ slug, url: u.split('?')[0], localPath: dest });
        console.log('DL', slug, n);
      } catch (e) { console.log('ERR', n, e.message); }
    }
  }
}

await browser.close();
fs.writeFileSync('stardust/current/_media-gapfill.json', JSON.stringify({
  _provenance: { writtenBy: 'stardust:prototype (media gap-fill, re-direct 2026-07-26)', writtenAt: new Date().toISOString(), renderedBy: 'playwright' },
  pages: out, downloads,
}, null, 1));
console.log('written _media-gapfill.json;', downloads.length, 'downloads');
