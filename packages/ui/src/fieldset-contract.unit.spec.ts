/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

/**
 * Contract: a group of controls reads as one control's Field does. A `<legend>` with
 * `.fieldset-legend` is drawn as `.field-label` is, and the group's description and error as the
 * Field's — from the same tokens, so restyling a Field restyles a group with it.
 */
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

/** Every rule's declarations, by each selector in its list. */
function rules(source: string): Map<string, string> {
  const bySelector = new Map<string, string>();
  for (const [, selectors = '', body = ''] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of selectors.split(',')) {
      const key = selector.trim();
      bySelector.set(key, (bySelector.get(key) ?? '') + body);
    }
  }
  return bySelector;
}

/** The --field-* tokens a selector's rules read, sorted: what it looks like, not its layout. */
function fieldTokens(source: string, selector: string): string[] {
  const body = rules(source).get(selector);
  if (body === undefined) throw new Error(`No rule for ${selector}`);
  return [...body.matchAll(/var\((--field-[a-z0-9-]+)\)/g)].map(([, name]) => name ?? '').sort();
}

describe('fieldset', () => {
  const field = css('components/field/field.css');
  const fieldset = css('components/fieldset/fieldset.css');

  it.each([
    ['.fieldset-legend', '.field-label'],
    ['.fieldset-description', '.field-description'],
    ['.fieldset-error', '.field-error'],
  ])('draws %s as %s', (group, single) => {
    expect(fieldTokens(fieldset, group)).toEqual(fieldTokens(field, single));
  });

  it('removes the native frame, so the group sits in a form as a Field does', () => {
    const body = rules(fieldset).get('.fieldset') ?? '';
    expect(body).toMatch(/border:\s*0/);
    expect(body).toMatch(/padding:\s*0/);
    expect(body).toMatch(/min-inline-size:\s*0/);
  });
});
