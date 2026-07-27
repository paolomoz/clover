/**
 * columns — split copy/media sections (schemas: pos-systems, restaurant,
 * pricing). Variants: media-left | stacked | pale | vt | apps | kiosk |
 * consult. Authoring: one row, two cells: copy | image (image optional for
 * `apps`). Copy order: eyebrow? → heading → body → CTAs (pre-heading short
 * text is buffered as the eyebrow, #76).
 */
export default async function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const out = document.createElement('div');
    out.className = 'cols-row';
    const copy = document.createElement('div');
    copy.className = 'cols-copy';
    const media = document.createElement('div');
    media.className = 'cols-media';

    cells.forEach((cell) => {
      const pic = cell.matches('picture, img') ? cell : cell.querySelector('picture, img');
      if (pic && !cell.querySelector('h1,h2,h3,h4,h5,h6')) {
        media.append(pic);
        return;
      }
      // copy cell: buffer a short pre-heading text run as the eyebrow (#76)
      const kids = [...cell.children];
      let seenHeading = false;
      kids.forEach((k) => {
        if (k.matches('h1,h2,h3,h4,h5,h6')) seenHeading = true;
        if (!seenHeading && k.tagName === 'P' && !k.querySelector('a, picture, img')
          && k.textContent.trim().length < 40 && !copy.querySelector('.eyebrow')
          && kids.some((s) => s.matches('h1,h2,h3,h4,h5,h6'))) {
          k.classList.add('eyebrow');
        }
        copy.append(k);
      });
    });

    out.append(copy);
    if (media.children.length) out.append(media);
    block.append(out);
  });
}
