/**
 * moving-parts — pos-systems controlled-scroll module (schema:
 * stardust/eds-schema/pos-systems.json, 5×DIV.stage). Sticky stage media
 * (CSS position: sticky — no scroll-jack JS, F-003). Authoring: one row per
 * stage, two cells: copy (h3 + strong-led feature lines or ol steps + CTA) |
 * device image. Media side alternates by index (#61).
 */
export default async function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';
  rows.forEach((row, i) => {
    const stage = document.createElement('div');
    stage.className = `stage${i % 2 === 1 ? ' media-left' : ''}`;
    const copy = document.createElement('div');
    copy.className = 'stage-copy';
    const media = document.createElement('div');
    media.className = 'stage-media';

    [...row.children].forEach((cell) => {
      const pic = cell.matches('picture, img') ? cell : cell.querySelector('picture, img');
      if (pic && !cell.querySelector('h1,h2,h3,h4,h5,h6')) {
        media.append(pic.closest('picture') || pic);
        return;
      }
      copy.append(...cell.childNodes);
    });

    // strong-led feature lines: <p><strong>Title</strong> body…</p>
    copy.querySelectorAll('p').forEach((p) => {
      if (p.querySelector(':scope > strong:first-child') && !p.querySelector('a')) {
        p.classList.add('feature-line');
      }
    });

    stage.append(copy);
    if (media.children.length) stage.append(media);
    block.append(stage);
  });
}
