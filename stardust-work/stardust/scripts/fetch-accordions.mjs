// One-off: expand and capture accordion content on pos-systems + contact
// (capture-time gap: accordions were not expanded during extract).
import { chromium } from 'playwright';
import fs from 'node:fs';

const targets = [
  { slug: 'pos-systems', url: 'https://www.clover.com/pos-systems' },
  { slug: 'contact', url: 'https://www.clover.com/contact' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const out = {};

for (const t of targets) {
  await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  // dismiss consent if present (text-based, per project crawler convention)
  for (const label of ['Accept', 'Accept all', 'I agree', 'OK']) {
    const btn = page.getByRole('button', { name: label, exact: false }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); break; }
  }
  await page.waitForTimeout(1000);
  // "View More FAQs" style expanders first
  for (const more of await page.locator('button:has-text("View More")').all()) {
    await more.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  const items = await page.evaluate(() => {
    const res = [];
    for (const btn of document.querySelectorAll('[aria-expanded][aria-controls]')) {
      const id = btn.getAttribute('aria-controls');
      const panel = id ? document.getElementById(id) : null;
      if (!panel) continue;
      res.push({ question: btn.innerText.trim(), expanded: btn.getAttribute('aria-expanded') });
    }
    return res;
  });
  // expand each and capture panel HTML text + links
  const captured = [];
  const buttons = await page.locator('[aria-expanded][aria-controls]').all();
  for (const btn of buttons) {
    const q = (await btn.innerText().catch(() => '')).trim();
    if (!q) continue;
    const expanded = await btn.getAttribute('aria-expanded');
    if (expanded === 'false') { await btn.click().catch(() => {}); await page.waitForTimeout(400); }
    const panelId = await btn.getAttribute('aria-controls');
    const data = await page.evaluate((id) => {
      const p = document.getElementById(id);
      if (!p) return null;
      const links = [...p.querySelectorAll('a')].map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }));
      return { text: p.innerText.trim(), links };
    }, panelId);
    if (data && data.text) captured.push({ question: q, answer: data.text, links: data.links });
  }
  out[t.slug] = { url: t.url, fetchedAt: new Date().toISOString(), renderedBy: 'playwright', items: captured, discovered: items.length };
  console.log(t.slug, '->', captured.length, 'items captured of', items.length, 'discovered');
}

await browser.close();
fs.writeFileSync('stardust/current/_accordion-content.json', JSON.stringify({
  _provenance: { writtenBy: 'stardust:prototype (accordion gap-fill)', writtenAt: new Date().toISOString(), renderedBy: 'playwright', note: 'extract did not expand accordions; live-sourced for verbatim content (pricing anchor-price precedent)' },
  pages: out,
}, null, 2));
console.log('written stardust/current/_accordion-content.json');
