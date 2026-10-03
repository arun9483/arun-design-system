/**
 * Gives every table written in content a Tab stop.
 *
 * Starlight makes each content table its own horizontal scroll box, so a table wider than
 * the column — most of them on a phone — scrolls, and a scroll box with nothing focusable in
 * it cannot be scrolled from the keyboard (axe: scrollable-region-focusable, WCAG 2.1.1).
 * Focusing the table itself also lets a screen reader announce it as a table on arrival.
 */
export function rehypeFocusableTables() {
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'table') {
      node.properties = { ...node.properties, tabIndex: 0 };
    }
    for (const child of node.children ?? []) visit(child);
  };
  return (tree) => visit(tree);
}
