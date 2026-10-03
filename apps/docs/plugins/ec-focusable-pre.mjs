/**
 * Expressive Code plugin: makes every code block's `<pre>` focusable.
 *
 * A long line scrolls the `<pre>` sideways, and a scroll box with nothing focusable inside
 * cannot be scrolled from the keyboard (axe: scrollable-region-focusable, WCAG 2.1.1). A Tab
 * stop on the `<pre>` lets keyboard users reach it and scroll it with the arrow keys. Covers
 * fenced code in Markdown and the `<Code>` component alike, since both render through
 * Expressive Code.
 */
export function focusablePre() {
  return {
    name: 'focusable-pre',
    hooks: {
      postprocessRenderedBlock({ renderData }) {
        const visit = (node) => {
          if (node.type === 'element' && node.tagName === 'pre') {
            node.properties = { ...node.properties, tabIndex: 0 };
            return;
          }
          for (const child of node.children ?? []) visit(child);
        };
        visit(renderData.blockAst);
      },
    },
  };
}
