/**
 * hero-split — pos-systems hero (schema: stardust/eds-schema/pos-systems.json
 * section hero). Template-slotted (#95): query roles, never row indexes (#42).
 * Authoring (one cell or rich rows): h1 / lede p / CTA p / product image.
 * Sets the LCP image eager + high priority (#100).
 */
export default async function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const pic = block.querySelector('picture, img');
  const ps = [...block.querySelectorAll('p')];
  const lede = ps.find((p) => !p.querySelector('a, picture, img') && p.textContent.trim());
  const ctas = ps.filter((p) => p.querySelector('a'));

  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (heading) {
    const inner = heading.querySelector('h1,h2,h3') || heading;
    const h1 = document.createElement('h1');
    h1.append(...inner.childNodes);
    copy.append(h1);
  }
  if (lede) {
    lede.classList.add('lede');
    copy.append(lede);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctas.forEach((p) => actions.append(p));
    copy.append(actions);
  }

  const media = document.createElement('div');
  media.className = 'hero-media';
  if (pic) {
    media.append(pic.closest('picture') || pic);
    const img = media.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    }
  }

  block.replaceChildren(copy, media);
}
