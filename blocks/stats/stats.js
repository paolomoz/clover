/**
 * stats — home "Run the numbers" lime stat band (schema: home.json,
 * 3×LI). Captured numbers only. Authoring: lead row: h2; then one row per
 * stat: value | title | body.
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const head = document.createElement('div');
  head.className = 'stats-head';
  const list = document.createElement('ul');

  rows.forEach((row) => {
    const cells = [...row.children];
    const h = row.querySelector('h1,h2,h3');
    if (cells.length === 1 && h) {
      const h2 = document.createElement('h2');
      h2.append(...h.childNodes);
      head.append(h2);
      return;
    }
    if (!cells.length) return;
    const li = document.createElement('li');
    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = cells[0].textContent.trim();
    li.append(value);
    if (cells[1]) {
      const t = document.createElement('h3');
      t.textContent = cells[1].textContent.trim();
      li.append(t);
    }
    if (cells[2] && cells[2].textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cells[2].childNodes);
      li.append(p);
    }
    list.append(li);
  });

  block.replaceChildren(head, list);
}
