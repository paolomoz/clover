import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Clover footer — /footer sections: brand / 8 link columns / meta (locale +
 * social) / legal. Groups the link columns into a 4-col grid and tags the
 * meta + legal rows; content order is the authored order.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = [...footer.children];
  const isColumn = (s) => s.querySelector('h2') && s.querySelector('ul');
  const columns = sections.filter(isColumn);
  if (columns.length) {
    const grid = document.createElement('div');
    grid.className = 'footer-grid';
    columns[0].before(grid);
    columns.forEach((c) => grid.append(c));
  }

  // meta = the section holding social image links; legal = the last section
  const meta = sections.find((s) => !isColumn(s) && s.querySelector('ul a img'));
  if (meta) meta.classList.add('footer-meta');
  const legal = sections[sections.length - 1];
  if (legal && legal !== meta && !isColumn(legal)) legal.classList.add('footer-legal');

  block.append(footer);
}
