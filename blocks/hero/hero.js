/**
 * hero — home video hero (schema: stardust/eds-schema/home.json). Captured
 * ambient Contentful video + scrim + display h1 + lede + CTA pair
 * (Poster Rule: opaque poster ground; reduced-motion hides the video).
 * Authoring: video URL as a plain link / h1 / lede / CTA paragraphs.
 */
export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  const videoLink = links.find((a) => /\.mp4($|\?)/.test(a.href));
  const heading = block.querySelector('h1, h2');
  const ps = [...block.querySelectorAll('p')];
  const lede = ps.find((p) => !p.querySelector('a') && p.textContent.trim());
  // CTAs: decorated buttons first, emphasis-wrapped links as the fallback
  // (decorateButtons may not have run in a harness render); never the video link
  const ctas = ps.filter((p) => {
    const a = p.querySelector('a');
    return a && a !== videoLink && !/\.mp4($|\?)/.test(a.href);
  });

  const container = document.createElement('div');
  container.className = 'hero-content';
  if (heading) {
    const inner = heading.querySelector('h1,h2,h3') || heading;
    const h1 = document.createElement('h1');
    h1.append(...inner.childNodes);
    container.append(h1);
  }
  if (lede) {
    lede.classList.add('lede');
    container.append(lede);
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    ctas.forEach((p) => actions.append(p));
    container.append(actions);
  }

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.setAttribute('aria-hidden', 'true');

  block.replaceChildren(scrim, container);

  if (videoLink) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.width = 1920;
    video.height = 1080;
    video.src = videoLink.href;
    block.prepend(video);
  }
}
