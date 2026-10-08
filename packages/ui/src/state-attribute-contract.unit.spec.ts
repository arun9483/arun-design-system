/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

/**
 * Contract: @arun-dev/ui must not style a `data-*` attribute that @arun-dev/headless
 * does not emit.
 *
 * The two packages meet only in the rendered DOM — headless decides *when* a switch is
 * checked, ui decides what checked *looks like*, and the attribute name is the entire
 * link between them. Nothing imports it, so nothing checks it. Rename `data-checked`
 * in headless and TypeScript stays green, every unit test stays green, and switches
 * silently render permanently-off.
 *
 * This is the `data-*` counterpart to the token contract: same failure mode, other seam.
 *
 * Comments are stripped from both sides before scanning, because both sides document
 * themselves with the very strings being counted: headless docstrings show example
 * selectors that are not emissions, and ui's stylesheets name attributes they have
 * deliberately chosen *not* to style. Counting either would make the contract report
 * something it never checked.
 *
 * Scanning all sources rather than one file matters: each component spells its own
 * attributes out, and `Button` emits `data-disabled` without a shared helper.
 */

const EMISSION = /'(data-[a-z0-9-]+)'/g;
const USAGE = /\[\s*(data-[a-z0-9-]+)/g;

/**
 * Emitted but not styled here. Not a failure: the attributes are a public API, and a
 * consumer writing their own CSS may read them.
 *
 * `data-unchecked` is deliberate. ui styles the unchecked switch as its base rule and
 * overrides with `[data-checked]`, so it never needs the negative form. The attribute
 * exists so that adding a third state (Checkbox's `indeterminate`) stays additive —
 * `:not([data-checked])` would silently absorb it, `[data-unchecked]` will not.
 * `data-unselected` is Tabs' equivalent, unstyled for the same reason: the unselected tab
 * is the base rule, `[data-selected]` the override.
 *
 * `data-open` / `data-closed` are Dialog's. ui styles the popup from the native `[open]`
 * attribute instead: `display` follows `[open]` in the UA sheet, and a `<form
 * method="dialog">` removes it before React re-renders, so animating from the same
 * attribute keeps the two in step. The data pair is there for a Trigger, or for consumers.
 * Popover's popup is styled from `:popover-open` for the same reason. `data-open` is styled
 * once, on Combobox's chevron, which turns while the list is open; `data-closed` is not.
 *
 * `data-invalid` and `data-required` are Field's, on every part. ui styles an invalid control from
 * `aria-invalid`, which Field.Control sets, so the field reads the same with or without Field;
 * and a required marker is the label's text, the consumer's — an asterisk is not drawn here.
 *
 * `data-align` is Popover's. Alignment is placement, which headless sets inline as
 * `position-area`, so ui has nothing to add; `data-side` is styled, for the offset's axis.
 *
 * `data-complete` is OtpInput's Root, set once every slot holds a character. A full code looks
 * like a filled one here; the attribute is for a consumer's success style.

 */
const UNSTYLED_HERE = [
  'data-align',
  'data-closed',
  'data-complete',
  'data-invalid',
  'data-required',
  'data-unchecked',
  'data-unselected',
];

// Both sides' sources as text, found relative to this file rather than cwd, so the test works
// wherever vitest runs.
const HEADLESS_GLOB = '../../headless/src/**/*.{ts,tsx}';
const UI_GLOB = './**/*.css';
const headlessSources = import.meta.glob<string>('../../headless/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const uiStyles = import.meta.glob<string>('./**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Comments hold example selectors and sample mappings, which are not emissions. */
function stripComments(source: string): string {
  return stripBlockComments(source).replace(/\/\/.*$/gm, '');
}

/**
 * CSS has only block comments, and stripping `//` here would eat the rest of any line
 * holding a `url(https://…)`. Both sides of this contract need their comments gone:
 * headless docstrings show example emissions, and ui's show example selectors — and a
 * commented-out selector that still counted would report an attribute as styled when
 * nothing styles it.
 */
function stripBlockComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every `data-*` attribute @arun-dev/headless emits, keyed to the file declaring it. */
function emittedBy(sources: Record<string, string>): Map<string, string> {
  const attributes = new Map<string, string>();

  for (const [file, source] of Object.entries(sources)) {
    if (file.includes('.spec.')) continue;

    const relative = file.slice(file.indexOf('src'));
    for (const [, name] of stripComments(source).matchAll(EMISSION)) {
      if (name && !attributes.has(name)) attributes.set(name, relative);
    }
  }
  return attributes;
}

/** Every `[data-*]` selector in this package's CSS, comments excluded. */
function styledBy(styles: Record<string, string>): Map<string, string> {
  const attributes = new Map<string, string>();

  for (const [file, source] of Object.entries(styles)) {
    const relative = `src/${file.slice(2)}`;
    for (const [, name] of stripBlockComments(source).matchAll(USAGE)) {
      if (name && !attributes.has(name)) attributes.set(name, relative);
    }
  }
  return attributes;
}

describe('state attribute contract', () => {
  const emitted = emittedBy(headlessSources);
  const styled = styledBy(uiStyles);

  it('finds the attributes and selectors it is meant to check', () => {
    // Guards the scan itself: a rename or move would otherwise empty both sets and
    // leave the contract passing while checking nothing.
    expect(emitted.size, `no data-* attributes found in ${HEADLESS_GLOB}`).toBeGreaterThan(0);
    expect(styled.size, `no [data-*] selectors found in ${UI_GLOB}`).toBeGreaterThan(0);
  });

  it('emits every data-* attribute that @arun-dev/ui styles', () => {
    const unmatched = [...styled]
      .filter(([name]) => !emitted.has(name))
      .map(([name, file]) => `${name} (styled in ${file})`);

    expect(
      unmatched,
      'These selectors can never match: no component in @arun-dev/headless emits them. ' +
        'Either the attribute was renamed in headless, or the selector is a typo.',
    ).toEqual([]);
  });

  it('tracks attributes that are emitted but not styled here', () => {
    const unstyled = [...emitted.keys()].filter((name) => !styled.has(name)).sort();

    expect(
      unstyled,
      'A newly emitted attribute is unstyled by @arun-dev/ui. That is allowed — see ' +
        'UNSTYLED_HERE — but it should be a decision, not an oversight. Add a selector, ' +
        'or add the attribute to UNSTYLED_HERE with the reason.',
    ).toEqual(UNSTYLED_HERE);
  });
});
