/**
 * segment-router — pricing hero's 6 receipt tiles (schema:
 * stardust/eds-schema/pricing.json, section hero repeats). Accepted design
 * from impeccable live session 837645b3: icon + label header row, big price
 * lead over a dashed hairline rule. Authoring: one row per tile:
 * icon image | label link | anchor price text.
 */
export default async function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const icon = row.querySelector('picture, img');
    const link = row.querySelector('a');
    const priceCell = cells[cells.length - 1];
    const priceText = priceCell.textContent.trim();

    const card = document.createElement('a');
    card.className = 'router-card';
    if (link) card.href = link.href;

    const top = document.createElement('span');
    top.className = 'router-top';
    if (icon) top.append(icon);
    const label = document.createElement('span');
    label.className = 'router-label';
    label.textContent = link ? link.textContent.trim() : cells[0].textContent.trim();
    top.append(label);

    const price = document.createElement('span');
    price.className = 'router-price';
    const cut = priceText.indexOf('/mo');
    const lead = cut > -1 ? priceText.slice(0, cut + 3) : priceText;
    const rest = cut > -1 ? priceText.slice(cut + 3) : '';
    const b = document.createElement('b');
    b.textContent = lead;
    price.append(b);
    if (rest) {
      const small = document.createElement('small');
      small.textContent = rest;
      price.append(small);
    }

    card.append(top, price);
    block.append(card);
  });
}
