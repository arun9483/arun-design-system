import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* eslint-disable security/detect-non-literal-fs-filename --
   Every path here is derived from import.meta.url and stays inside this repository's
   own source tree; nothing originates from user input or runtime data, so the
   path-traversal heuristic this rule implements does not apply. */
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

function cssFilesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFilesIn(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

function definitionsIn(dir: string): Set<string> {
  const names = new Set<string>();
  for (const file of cssFilesIn(dir)) {
    for (const [, name] of readFileSync(file, 'utf8').matchAll(DEFINITION)) {
      if (name) names.add(name);
    }
  }
  return names;
}

/** Every `var(--x)` read by the UI package, split by whether it declares a fallback. */
function usagesIn(dir: string) {
  const required = new Map<string, string>();
  const optional = new Map<string, string>();

  for (const file of cssFilesIn(dir)) {
    const relative = file.slice(file.indexOf('src'));
    for (const [, name, comma] of readFileSync(file, 'utf8').matchAll(USAGE)) {
      if (!name) continue;
      const bucket = comma === ',' ? optional : required;
      if (!bucket.has(name)) bucket.set(name, relative);
    }
  }
  return { required, optional };
}

describe('token contract', () => {
  // Resolved from this file, not cwd, so the test works regardless of where vitest runs.
  const UI_SRC = dirname(fileURLToPath(import.meta.url));
  const TOKENS_SRC = join(UI_SRC, '..', '..', 'tokens', 'src');

  const defined = definitionsIn(TOKENS_SRC);
  const { required, optional } = usagesIn(UI_SRC);

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
