/**
 * tiles — icon tile rows (pos-systems quick-benefits / more-features /
 * peace-of-mind; schema: stardust/eds-schema/pos-systems.json).
 * Authoring: one row per tile: icon image | label (plain text or h3) | body?
 * Labels authored as h3 render as headings; plain-text labels render as
 * uppercase strong labels (captured tile convention, F-007-safe).
 */
export default async function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const tile = document.createElement('div');
    tile.className = 'tile';
    cells.forEach((cell) => {
      const media = cell.matches('picture, img') ? cell : cell.querySelector('picture, img');
      if (media) {
        tile.append(media);
        return;
      }
      const heading = cell.matches('h1,h2,h3,h4,h5,h6') ? cell : cell.querySelector('h1,h2,h3,h4,h5,h6');
      if (heading && !tile.querySelector('.tile-label')) {
        const h = document.createElement('h3');
        h.className = 'tile-label';
        h.append(...heading.childNodes);
        tile.append(h);
      } else if (!tile.querySelector('.tile-label') && cell.textContent.trim() && !tile.querySelector('p')) {
        const label = document.createElement('p');
        label.className = 'tile-label';
        label.textContent = cell.textContent.trim();
        tile.append(label);
      } else if (cell.textContent.trim()) {
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        tile.append(p);
      }
    });
    block.append(tile);
  });
}
