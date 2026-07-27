/**
 * hardware — home device showcase (schema: home.json, section hardware:
 * 5 slides + 5 thumbs). Full-bleed media layer per device (ambient video or
 * image) + radio thumb rail; head rows (h2 + CTAs) are collected whole (#56).
 * Authoring: lead rows: h2 / CTA paragraphs; then one row per device:
 * name | caption | thumb image | media (mp4 link or image).
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const head = document.createElement('div');
  head.className = 'hw-head';
  const devices = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const isDevice = cells.length >= 3
      || (cells[0] && cells[0].querySelector('picture, img') && cells.length > 1);
    if (!isDevice) {
      // head rows: heading + CTA paragraphs (collect ALL leading non-device rows, #56)
      cells.forEach((cell) => {
        const h = cell.querySelector('h1,h2,h3');
        if (h) {
          const h2 = document.createElement('h2');
          h2.append(...h.childNodes);
          head.append(h2);
        } else if (cell.querySelector('a')) {
          let actions = head.querySelector('.actions');
          if (!actions) {
            actions = document.createElement('div');
            actions.className = 'actions';
            head.append(actions);
          }
          [...cell.children].forEach((c) => actions.append(c));
        }
      });
      return;
    }
    const name = cells[0].textContent.trim();
    const caption = cells[1] ? cells[1].textContent.trim() : '';
    const thumb = cells[2] ? cells[2].querySelector('picture, img') : null;
    const mediaCell = cells[3];
    const mediaLink = mediaCell ? mediaCell.querySelector('a') : null;
    const mediaImg = mediaCell ? mediaCell.querySelector('picture, img') : null;
    devices.push({
      name, caption, thumb, mediaSrc: mediaLink ? mediaLink.href : null, mediaImg,
    });
  });

  block.textContent = '';

  // media layers
  devices.forEach((d, i) => {
    if (d.mediaSrc && /\.mp4($|\?)/.test(d.mediaSrc)) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = i === 0 ? 'metadata' : 'none';
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('tabindex', '-1');
      video.className = `hw-media${i === 0 ? ' active' : ''}`;
      video.src = d.mediaSrc;
      block.append(video);
      d.layer = video;
    } else if (d.mediaImg) {
      const img = d.mediaImg.closest('picture') || d.mediaImg;
      img.className = `hw-media${i === 0 ? ' active' : ''}`;
      img.setAttribute('aria-hidden', 'true');
      block.append(img);
      d.layer = img;
    }
  });

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.setAttribute('aria-hidden', 'true');
  block.append(scrim);

  const inner = document.createElement('div');
  inner.className = 'hw-inner';
  inner.append(head);

  const slides = document.createElement('div');
  slides.className = 'device-slides';
  const rail = document.createElement('div');
  rail.className = 'device-rail';
  rail.setAttribute('role', 'group');
  rail.setAttribute('aria-label', 'Choose a device');

  devices.forEach((d, i) => {
    const slide = document.createElement('article');
    slide.className = `device-slide${i === 0 ? ' active' : ''}`;
    const h3 = document.createElement('h3');
    h3.textContent = d.name;
    const cap = document.createElement('p');
    cap.className = 'caption';
    cap.textContent = d.caption;
    slide.append(h3, cap);
    slides.append(slide);

    const label = document.createElement('label');
    label.className = 'device-thumb';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'device';
    input.checked = i === 0;
    input.setAttribute('aria-label', `Select ${d.name}`);
    input.addEventListener('change', () => {
      block.querySelectorAll('.hw-media, .device-slide').forEach((el) => el.classList.remove('active'));
      if (d.layer) {
        d.layer.classList.add('active');
        if (d.layer.tagName === 'VIDEO') d.layer.play().catch(() => {});
      }
      slide.classList.add('active');
    });
    label.append(input);
    if (d.thumb) label.append(d.thumb.closest('picture') || d.thumb);
    const span = document.createElement('span');
    span.textContent = d.name;
    label.append(span);
    rail.append(label);
  });

  const carousel = document.createElement('div');
  carousel.className = 'device-carousel';
  carousel.append(slides, rail);
  inner.append(carousel);
  block.append(inner);
}
