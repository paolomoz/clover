/**
 * quote — home video testimonial (schema: home.json, section testimonial).
 * Ambient video ground + blockquote + merchant chip. Authoring:
 * video URL link / quote text / merchant name / merchant org / avatar image.
 */
export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  const videoLink = links.find((a) => /\.mp4($|\?)/.test(a.href));
  const avatar = block.querySelector('picture, img');
  const texts = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('a, picture, img') && p.textContent.trim())
    .map((p) => p.textContent.trim());
  const [quoteText, name, org] = texts;

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.setAttribute('aria-hidden', 'true');

  const bq = document.createElement('blockquote');
  const q = document.createElement('p');
  q.className = 'quote-text';
  q.textContent = quoteText || '';
  bq.append(q);

  const footer = document.createElement('footer');
  const chip = document.createElement('div');
  chip.className = 'merchant-chip';
  if (avatar) chip.append(avatar.closest('picture') || avatar);
  const cite = document.createElement('cite');
  if (name) {
    const n = document.createElement('span');
    n.className = 'merchant-name';
    n.textContent = name;
    cite.append(n);
  }
  if (org) {
    const o = document.createElement('span');
    o.className = 'merchant-org';
    o.textContent = org;
    cite.append(o);
  }
  chip.append(cite);
  footer.append(chip);
  bq.append(footer);

  const inner = document.createElement('div');
  inner.className = 'quote-inner';
  inner.append(bq);
  block.replaceChildren(scrim, inner);

  if (videoLink) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.src = videoLink.href;
    block.prepend(video);
  }
}
