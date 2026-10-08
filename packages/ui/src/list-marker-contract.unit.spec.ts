/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

/**
 * Contract: the reset keeps list markers. In running text a bullet or a number is part of the
 * content, so the reset strips them only from a list that opts out with `role="list"`. The
 * components that render a list as layout remove them themselves.
 */
// Every stylesheet of this package, read when the test loads.
const sources = import.meta.glob<string>('./**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const css = (path: string) => {
  const source = sources[`./${path}`];
  if (source === undefined) throw new Error(`No stylesheet at src/${path}`);
  return source;
};

/** Every rule whose selector list is exactly these selectors, comments removed. */
function rulesFor(source: string, selector: RegExp) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors = '']) => selector.test(selectors.trim()))
    .map(([, , body = '']) => body);
}

describe('list markers', () => {
  it('are kept on plain lists by the reset', () => {
    const plain = rulesFor(css('css/reset.css'), /^ul,\s*ol$/);
    expect(plain).toHaveLength(1);
    expect(plain[0]).not.toMatch(/list-style/);
    expect(plain[0]).not.toMatch(/padding\s*:\s*0/);
  });

  it('are removed by the reset only from a list with role="list"', () => {
    const optedOut = rulesFor(css('css/reset.css'), /^ul\[role='list'\],\s*ol\[role='list'\]$/);
    expect(optedOut).toHaveLength(1);
    expect(optedOut[0]).toMatch(/list-style\s*:\s*none/);
  });

  it('are removed by the components that render a list as layout', () => {
    for (const [file, selector] of [
      ['components/stack/stack.css', /^:where\(ul, ol\)\.layout-stack$/],
      ['components/grid/grid.css', /^:where\(ul, ol\)\.layout-grid$/],
      ['components/breadcrumb/breadcrumb.css', /^\.breadcrumb-list$/],
      ['components/pagination/pagination.css', /^\.pagination-list$/],
      ['components/tree-view/tree-view.css', /^\.tree-view,\s*\.tree-view \[role='group'\]$/],
    ] as const) {
      const rules = rulesFor(css(file), selector);
      expect(rules, `${selector} in ${file}`).toHaveLength(1);
      expect(rules[0], `${selector} in ${file}`).toMatch(/list-style\s*:\s*none/);
    }
  });
});
