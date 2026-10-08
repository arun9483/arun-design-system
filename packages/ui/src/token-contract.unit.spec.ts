/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

/**
 * Contract: @arun-dev/ui must not read a CSS custom property that @arun-dev/tokens
 * does not define.
 *
 * An undeclared dependency of that kind fails silently — the var() resolves as
 * invalid at computed-value time, a fallback or the initial value quietly takes
 * over, and nothing warns. Class-name assertions cannot see it.
 *
 * The single escape hatch is an explicit fallback: `var(--x, <fallback>)` declares
 * that the property is optional and names what happens without it.
 */

const DEFINITION = /^\s*(--[a-z0-9-]+)\s*:/gm;
const USAGE = /var\(\s*(--[a-z0-9-]+)\s*(,?)/g;

// Both packages' stylesheets as text, found relative to this file rather than cwd, so the test
// works wherever vitest runs.
const tokenStyles = import.meta.glob<string>('../../tokens/src/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const uiStyles = import.meta.glob<string>('./**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function definitionsIn(styles: Record<string, string>): Set<string> {
  const names = new Set<string>();
  for (const source of Object.values(styles)) {
    for (const [, name] of source.matchAll(DEFINITION)) {
      if (name) names.add(name);
    }
  }
  return names;
}

/** Every `var(--x)` read by the UI package, split by whether it declares a fallback. */
function usagesIn(styles: Record<string, string>) {
  const required = new Map<string, string>();
  const optional = new Map<string, string>();

  for (const [file, source] of Object.entries(styles)) {
    const relative = `src/${file.slice(2)}`;
    for (const [, name, comma] of source.matchAll(USAGE)) {
      if (!name) continue;
      const bucket = comma === ',' ? optional : required;
      if (!bucket.has(name)) bucket.set(name, relative);
    }
  }
  return { required, optional };
}

describe('token contract', () => {
  const defined = definitionsIn(tokenStyles);
  const { required, optional } = usagesIn(uiStyles);

  it('finds the definitions and usages it is meant to check', () => {
    // A moved directory would otherwise empty both sets and leave the contract checking nothing.
    expect(defined.size).toBeGreaterThan(0);
    expect(required.size).toBeGreaterThan(0);
  });

  it('defines every custom property that @arun-dev/ui requires', () => {
    const missing = [...required]
      .filter(([name]) => !defined.has(name))
      .map(([name, file]) => `${name} (used in ${file})`);

    expect(
      missing,
      'These are read without a fallback but never defined by @arun-dev/tokens. ' +
        'Either add them to the token layer, or give the var() an explicit fallback ' +
        'to declare the property optional.',
    ).toEqual([]);
  });

  it('only reads consumer-supplied properties through an explicit fallback', () => {
    const consumerSupplied = [...optional]
      .filter(([name]) => !defined.has(name))
      .map(([name]) => name)
      .sort();

    // Nothing is consumer-supplied any more: the deprecated difficulty-* variants,
    // which required six --color-difficulty-* tokens this package never shipped, were
    // removed in 0.3.0. This list must stay empty.
    expect(consumerSupplied).toEqual([]);
  });
});
