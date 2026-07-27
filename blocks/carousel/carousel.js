/**
 * carousel — scroll-snap card rails (restaurant `ops` 6 slides, `tools` 8
 * devices; schema: stardust/eds-schema/pos-solutions__restaurant.json).
 * Authoring: one row per slide: image | h3 title | body?
 * Chevron buttons scroll the track; track bleeds to the right window edge
 * (captured trait). prefers-reduced-motion: instant scroll.
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', 'Carousel — scroll horizontally');

  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.className = 'slide-card';
    const pic = row.querySelector('picture, img');
    if (pic) slide.append(pic);
    const copy = document.createElement('div');
    copy.className = 'slide-copy';
    [...row.querySelectorAll('h2, h3, h4, p')].forEach((el) => {
      if (el.querySelector('picture, img') || !el.textContent.trim()) return;
      if (el.matches('h2, h3, h4')) {
        const h = document.createElement('h3');
        h.append(...el.childNodes);
        copy.append(h);
      } else {
        copy.append(el);
      }
    });
    if (copy.children.length) slide.append(copy);
    track.append(slide);
  });

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous slides');
  prev.textContent = '‹';
  const next = document.createElement('button');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next slides');
  next.textContent = '›';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => {
    const first = track.firstElementChild;
    return first ? first.getBoundingClientRect().width + 24 : 300;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }));
  nav.append(prev, next);

  block.textContent = '';
  block.append(track, nav);
}
