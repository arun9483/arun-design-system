/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

/**
 * Contract: `.sr-only` hides text from sight but not from assistive technology, and wins over
 * whatever else styles the element. `.sr-only-focusable` does the same until it, or something
 * in it, has focus — a skip link appears when tabbed to.
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
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
};

function rule(source: string, selector: string): string {
  const start = source.indexOf(selector);
  if (start === -1) return '';
  return source.slice(source.indexOf('{', start) + 1, source.indexOf('}', start));
}

describe('visually hidden', () => {
  const utilities = css('css/utilities.css');
  const body = rule(utilities, '.sr-only,\n  .sr-only-focusable:not(:focus, :focus-within)');

  it('is a utility, in the last layer, not the reset', () => {
    expect(css('css/reset.css')).not.toContain('.sr-only');
    expect(body).not.toBe('');
  });

  it('clips a 1px box rather than removing the text', () => {
    expect(body).toMatch(/position:\s*absolute/);
    expect(body).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(body).toMatch(/overflow:\s*hidden/);
    expect(body).toMatch(/white-space:\s*nowrap/);
    expect(body).not.toMatch(/display:\s*none|visibility:\s*hidden/);
  });

  it('shows the focusable variant while it or its content has focus', () => {
    expect(utilities).toContain('.sr-only-focusable:not(:focus, :focus-within)');
  });
});
