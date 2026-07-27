/**
 * segment-band — home audience-routing pills (schema: home.json,
 * section segment-band). Authoring: label text | pills (list of links) |
 * specialists link.
 */
export default async function decorate(block) {
  const label = document.createElement('span');
  label.className = 'band-label';
  const pills = document.createElement('nav');
  pills.className = 'pills';
  pills.setAttribute('aria-label', 'Business type');
  let specialists = null;

  const cells = [...block.querySelectorAll(':scope > div > div')];
  cells.forEach((cell) => {
    const list = cell.querySelector('ul, ol');
    if (list) {
      [...list.querySelectorAll('a')].forEach((a, i) => {
        a.className = 'pill';
        if (i === 0) a.setAttribute('aria-current', 'true');
        pills.append(a);
      });
      return;
    }
    const link = cell.querySelector('a');
    if (link) {
      link.className = 'specialists';
      specialists = link;
      return;
    }
    if (cell.textContent.trim() && !label.textContent) {
      label.textContent = cell.textContent.trim();
    }
  });

  block.replaceChildren(label, pills);
  if (specialists) block.append(specialists);
}
