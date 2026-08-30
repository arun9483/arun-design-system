import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* eslint-disable security/detect-non-literal-fs-filename --
   Every path here is derived from import.meta.url and stays inside this repository's
   own source tree; nothing originates from user input or runtime data, so the
   path-traversal heuristic this rule implements does not apply. */
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
 * Attribute names are read from every source file in @arun-dev/headless, with comments
 * stripped first — several docstrings show example selectors that are not emissions.
 * Scanning all sources rather than the `stateAttributes.ts` mappings alone matters:
 * `useButton` emits `data-disabled` directly, without going through a mapping.
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
 */
const UNSTYLED_HERE = ['data-unchecked'];

function filesIn(dir: string, extension: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(path, extension);
    return entry.name.endsWith(extension) ? [path] : [];
  });
}

/** Comments hold example selectors and sample mappings, which are not emissions. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** Every `data-*` attribute @arun-dev/headless emits, keyed to the file declaring it. */
function emittedBy(headlessSrc: string): Map<string, string> {
  const attributes = new Map<string, string>();

  for (const file of filesIn(headlessSrc, '.ts').concat(filesIn(headlessSrc, '.tsx'))) {
    if (file.includes('.spec.')) continue;

    const relative = file.slice(file.indexOf('src'));
    for (const [, name] of stripComments(readFileSync(file, 'utf8')).matchAll(EMISSION)) {
      if (name && !attributes.has(name)) attributes.set(name, relative);
    }
  }
  return attributes;
}

/** Every `[data-*]` selector in this package's CSS. */
function styledBy(uiSrc: string): Map<string, string> {
  const attributes = new Map<string, string>();

  for (const file of filesIn(uiSrc, '.css')) {
    const relative = file.slice(file.indexOf('src'));
    for (const [, name] of readFileSync(file, 'utf8').matchAll(USAGE)) {
      if (name && !attributes.has(name)) attributes.set(name, relative);
    }
  }
  return attributes;
}

describe('state attribute contract', () => {
  // Resolved from this file, not cwd, so the test works regardless of where vitest runs.
  const UI_SRC = dirname(fileURLToPath(import.meta.url));
  const HEADLESS_SRC = join(UI_SRC, '..', '..', 'headless', 'src');

  const emitted = emittedBy(HEADLESS_SRC);
  const styled = styledBy(UI_SRC);

  it('finds the state-attribute mappings it is meant to check', () => {
    // Guards the scan itself: a rename or move would otherwise empty both sets and
    // leave the contract passing while checking nothing.
    expect(emitted.size, `no data-* attributes found under ${HEADLESS_SRC}`).toBeGreaterThan(0);
    expect(styled.size, `no [data-*] selectors found under ${UI_SRC}`).toBeGreaterThan(0);
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
