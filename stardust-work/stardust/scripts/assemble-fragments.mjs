// Inject shared canon fragments (favicon, footer) + per-page live-sourced
// accordion content into a proposed prototype. Idempotent per marker.
import fs from 'node:fs';

const [,, target, slug, mode] = process.argv; // mode: 'faq' | 'contact-directory' | 'none'
let html = fs.readFileSync(target, 'utf8');

// favicon + footer (canon fragments, stardust/canon/)
const fav = fs.readFileSync('stardust/canon/favicon.html', 'utf8').split('\n').filter(l => l.startsWith('<link')).join('');
html = html.replace('<!--FAVICON-->', fav);
const footerRaw = fs.readFileSync('stardust/canon/footer.html', 'utf8');
const footer = footerRaw.slice(footerRaw.indexOf('<footer'));
html = html.replace('<!--FOOTER-->', footer.trim());

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (mode !== 'none') {
  const acc = slug === 'pricing'
    ? JSON.parse(fs.readFileSync('stardust/current/_pricing-faq.json', 'utf8'))
    : JSON.parse(fs.readFileSync('stardust/current/_accordion-content.json', 'utf8')).pages[slug];

  // linkify: wrap captured link texts in their hrefs within escaped paragraph text
  const linkify = (text, links) => {
    let out = esc(text);
    for (const l of links || []) {
      if (!l.href || !l.text) continue;
      const t = esc(l.text.split('\n')[0].trim());
      if (!t || t.length < 3) continue;
      const rel = l.href.startsWith('http') && !l.href.includes('clover.com') ? ' rel="noopener"' : '';
      if (out.includes(t) && !out.includes('>' + t + '<')) {
        out = out.replace(t, `<a href="${l.href}"${rel}>${t}</a>`);
      }
    }
    return out;
  };

  const items = acc.items.map((it, i) => {
    const paras = it.answer.split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);
    const body = paras.map(p => `<p>${linkify(p, it.links)}</p>`).join('\n          ');
    return `<details${i === 0 ? ' open' : ''}>
        <summary>${esc(it.question)}</summary>
        <div class="answer">
          ${body}
        </div>
      </details>`;
  }).join('\n      ');
  html = html.replace('<!--FAQ_ITEMS-->', items);

  if (mode === 'faq') {
    const jsonld = {
      '@context': 'https://schema.org',
      '@graph': [
        JSON.parse(fs.readFileSync('DESIGN.json', 'utf8')).extensions.metadata.organization,
        { '@type': 'WebSite', name: 'Clover', url: 'https://www.clover.com/' },
        {
          '@type': 'FAQPage',
          mainEntity: acc.items.map(it => ({
            '@type': 'Question',
            name: it.question,
            acceptedAnswer: { '@type': 'Answer', text: it.answer.replace(/\n+/g, ' ').trim() },
          })),
        },
      ],
    };
    html = html.replace('<!--JSONLD-->', `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 1)}\n</scr` + `ipt>`);
  }
  if (mode === 'contact-directory') {
    const jsonld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          ...JSON.parse(fs.readFileSync('DESIGN.json', 'utf8')).extensions.metadata.organization,
          contactPoint: [{ '@type': 'ContactPoint', telephone: '+1-833-318-0794', contactType: 'sales', areaServed: 'US' }],
        },
        { '@type': 'WebSite', name: 'Clover', url: 'https://www.clover.com/' },
        { '@type': 'ContactPage', name: 'Contact us | Clover', url: 'https://www.clover.com/contact' },
      ],
    };
    html = html.replace('<!--JSONLD-->', `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 1)}\n</scr` + `ipt>`);
  }
} else {
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      JSON.parse(fs.readFileSync('DESIGN.json', 'utf8')).extensions.metadata.organization,
      { '@type': 'WebSite', name: 'Clover', url: 'https://www.clover.com/' },
    ],
  };
  html = html.replace('<!--JSONLD-->', `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 1)}\n</scr` + `ipt>`);
}

fs.writeFileSync(target, html);
const leftover = (html.match(/<!--(FAVICON|FOOTER|FAQ_ITEMS|JSONLD)-->/g) || []);
console.log('assembled', target, leftover.length ? 'LEFTOVER MARKERS: ' + leftover.join(',') : 'clean');
