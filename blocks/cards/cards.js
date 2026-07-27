/**
 * cards — card grids (home flow/online-orders, pricing `tools`, restaurant
 * `segments`). Authoring: one row per card: image | h3 title | body? | link?
 * DA-flattened fallback: segments the single cell on the per-card heading
 * boundary (#52). `segments` variant wraps each card in its link
 * (whole-card anchor — plain authored link, not a button).
 */
function buildCard(nodes, block) {
  const isSegments = block.classList.contains('segments');
  const link = nodes.map((n) => (n.matches?.('a') ? n : n.querySelector?.('a:not(.button)'))).find(Boolean);
  const card = document.createElement(isSegments && link ? 'a' : 'div');
  card.className = 'card';
  if (isSegments && link) card.href = link.href;
  const body = document.createElement('div');
  body.className = 'card-body';
  nodes.forEach((n) => {
    const pic = n.matches?.('picture, img') ? n : n.querySelector?.('picture, img');
    if (pic && !n.matches?.('h1,h2,h3,h4,h5,h6')) {
      card.prepend(pic);
      if (n.tagName === 'P' && !n.textContent.trim()) return;
      if (n === pic || !n.textContent.trim()) return;
    }
    if (isSegments && link && (n === link || n.contains?.(link)) && !n.matches?.('h1,h2,h3,h4,h5,h6')) {
      const go = document.createElement('span');
      go.className = 'card-go';
      go.textContent = link.textContent.trim();
      body.append(go);
      return;
    }
    if (n.textContent.trim()) body.append(n);
  });
  if (body.children.length) card.append(body);
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const cards = [];
  if (rows.length === 1 && rows[0].firstElementChild
    && rows[0].querySelectorAll('h3, h4').length > 1) {
    // flattened single-cell shape: segment on card-heading boundary (#52)
    const kids = [...rows[0].firstElementChild.children];
    let group = null;
    kids.forEach((k) => {
      const leadPic = k.querySelector?.('picture, img') && !group;
      if (k.matches('h3, h4') || leadPic) {
        if (k.matches('h3, h4') && group && group.some((g) => g.matches('h3, h4'))) group = null;
        if (!group) { group = []; cards.push(group); }
      }
      if (group) group.push(k);
    });
  } else {
    rows.forEach((row) => {
      const cells = [...row.children];
      if (!cells.length) return;
      cards.push(cells.flatMap((c) => (c.children.length ? [...c.children] : [c])));
    });
  }
  block.textContent = '';
  cards.forEach((nodes) => block.append(buildCard(nodes, block)));
}
