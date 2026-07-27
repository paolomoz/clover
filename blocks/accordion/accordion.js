/**
 * accordion — FAQ / contact directory (schema: stardust/eds-schema/*.json,
 * sections faq / contact-accordion). Authoring: one row per item, two cells:
 * question | answer (answer may hold multiple paragraphs and links).
 * First item renders open. Green circled +/− marker, borderless rows
 * (captured classic treatment).
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const items = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    if (cells.length >= 2) {
      items.push({ q: cells[0], a: cells[1] });
    } else {
      // defensive: single-cell row — first text run is the question,
      // the rest is the answer (DA-flattened shape, #50)
      const kids = [...cells[0].children];
      if (!kids.length) return;
      const q = document.createElement('div');
      q.textContent = kids[0].textContent;
      const a = document.createElement('div');
      kids.slice(1).forEach((k) => a.append(k));
      items.push({ q, a });
    }
  });

  block.textContent = '';
  items.forEach(({ q, a }, i) => {
    const details = document.createElement('details');
    if (i === 0) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = q.textContent.trim();
    const answer = document.createElement('div');
    answer.className = 'accordion-answer';
    [...a.childNodes].forEach((n) => answer.append(n));
    details.append(summary, answer);
    block.append(details);
  });
}
