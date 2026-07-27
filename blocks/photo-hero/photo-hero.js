/**
 * photo-hero — restaurant hero (schema: pos-solutions__restaurant.json,
 * section hero). Captured chef photo as ground + opaque poster panel with
 * eyebrow (Poster Rule ≥4.5:1). Template-slotted; roles by query (#42/#51):
 * eyebrow = short pre-heading text, h1, lede = post-heading text, CTA p,
 * background image. LCP eager (#100).
 */
export default async function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const pic = block.querySelector('picture, img');
  const ps = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const textPs = ps.filter((p) => !p.querySelector('a') && p.textContent.trim());
  // eyebrow precedes the heading in DOM order (#51/#76)
  // eslint-disable-next-line no-bitwise
  const follows = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  const eyebrow = textPs.find((p) => heading && follows(p, heading));
  const lede = textPs.find((p) => p !== eyebrow);
  const ctas = ps.filter((p) => p.querySelector('a'));

  const media = document.createElement('div');
  media.className = 'hero-bg';
  if (pic) {
    media.append(pic.closest('picture') || pic);
    const img = media.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    }
  }

  const panel = document.createElement('div');
  panel.className = 'hero-panel';
  if (eyebrow) {
    eyebrow.classList.add('eyebrow');
    panel.append(eyebrow);
  }
  if (heading) {
    const inner = heading.querySelector('h1,h2,h3') || heading;
    const h1 = document.createElement('h1');
    h1.append(...inner.childNodes);
    panel.append(h1);
  }
  if (lede) {
    lede.classList.add('lede');
    panel.append(lede);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctas.forEach((p) => actions.append(p));
    panel.append(actions);
  }

  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  inner.append(panel);
  block.replaceChildren(media, inner);
}
