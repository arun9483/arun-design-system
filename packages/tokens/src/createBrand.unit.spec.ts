import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createBrand,
  generatePaletteFromSeed,
  DEFAULT_NEUTRAL,
  type BrandPalette,
} from './createBrand';

/* Parity guard: src/brands/default/semantic.css is the hand-audited source of truth (AAA
   contrast). These tests assert createBrand() generates identical semantic tokens for the
   default brand, so the two can never drift apart again. */

const semanticCss = readFile('./brands/default/semantic.css');
const paletteCss = readFile('./brands/default/palette.css');

function readFile(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), 'utf8');
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Extract `--var: value` declarations from the block following the given selector. */
function extractBlock(css: string, selector: string): Record<string, string> {
  const clean = stripComments(css);
  const start = clean.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  const open = clean.indexOf('{', start);
  const close = clean.indexOf('}', open);
  const body = clean.slice(open + 1, close);
  const vars: Record<string, string> = {};
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

function defaultBrandPalette(): BrandPalette {
  const vars = extractBlock(paletteCss, ':root');
  const palette: Partial<Record<number, string>> = {};
  for (const [name, value] of Object.entries(vars)) {
    const match = name.match(/^--color-brand-(\d+)$/);
    if (match) palette[Number(match[1])] = value;
  }
  return palette as BrandPalette;
}

const generated = createBrand({ name: 'default', palette: defaultBrandPalette() });

describe('createBrand parity with brands/default (source of truth: semantic.css)', () => {
  it.each([
    ['light', "[data-theme='light']"],
    ['dark explicit', "[data-theme='dark']"],
    ['dark system preference', ":root:not([data-theme='light'])"],
  ])('generates identical %s semantic tokens', (_label, selector) => {
    const expected = extractBlock(semanticCss, selector);
    const actual = extractBlock(generated, selector);
    expect(actual).toEqual(expected);
  });

  it('emits the default brand palette verbatim', () => {
    const expected = extractBlock(paletteCss, ':root');
    const actual = extractBlock(generated, ':root');
    for (const [name, value] of Object.entries(expected)) {
      if (name.startsWith('--color-brand-')) {
        expect(actual[name], name).toBe(value);
      }
    }
  });

  it('DEFAULT_NEUTRAL matches the default brand neutral palette', () => {
    const expected = extractBlock(paletteCss, ':root');
    for (const [shade, hex] of Object.entries(DEFAULT_NEUTRAL)) {
      expect(hex, `--color-neutral-${shade}`).toBe(expected[`--color-neutral-${shade}`]);
    }
  });
});

describe('createBrand output structure', () => {
  it('covers all four theme blocks (light, dark media, dark/light overrides)', () => {
    expect(generated).toContain(':root {');
    expect(generated).toContain('@media (prefers-color-scheme: dark)');
    expect(generated).toContain(":root:not([data-theme='light'])");
    expect(generated).toContain("[data-theme='dark']");
    expect(generated).toContain("[data-theme='light']");
  });

  it('accepts a seed color and emits a full palette', () => {
    const css = createBrand({ name: 'seeded', seed: '#0ea5e9' });
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(css).toMatch(new RegExp(`--color-brand-${shade}: #[0-9a-f]{6};`));
    }
  });
});

describe('generatePaletteFromSeed', () => {
  it('returns 11 valid hex colors with strictly decreasing lightness', () => {
    const palette = generatePaletteFromSeed('#7c3aed');
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
    const luminance = (hex: string): number =>
      parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
    for (const shade of shades) {
      expect(palette[shade]).toMatch(/^#[0-9a-f]{6}$/);
    }
    for (let i = 1; i < shades.length; i++) {
      expect(luminance(palette[shades[i]])).toBeLessThan(luminance(palette[shades[i - 1]]));
    }
  });
});

/** WCAG relative luminance of a #rrggbb colour. */
function relativeLuminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const light = Math.max(relativeLuminance(a), relativeLuminance(b));
  const dark = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (light + 0.05) / (dark + 0.05);
}

/** The colour a theme block gives `name`, following its var() into the palette. */
function resolve(css: string, selector: string, name: string): string {
  const palette = extractBlock(css, ':root');
  const value = extractBlock(css, selector)[name] ?? '';
  const reference = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  return reference ? (palette[reference] ?? '') : value;
}

/* Accent fills — primary Button, a checked Checkbox, Radio, Switch, the current page — are
   --color-text-accent, with --color-text-on-accent drawn on them. In dark mode the accent is
   light, so the text on it must be dark. */
describe('text on an accent fill', () => {
  const themes = [
    ['light', "[data-theme='light']"],
    ['dark', "[data-theme='dark']"],
    ['dark system preference', ":root:not([data-theme='light'])"],
  ] as const;

  it.each(themes)('meets AAA (7:1) in the default brand, %s', (_label, selector) => {
    const fill = resolve(generated, selector, '--color-text-accent');
    const text = resolve(generated, selector, '--color-text-on-accent');
    expect(contrast(fill, text)).toBeGreaterThanOrEqual(7);
  });

  // Blue, red, green, teal, purple and pink seeds, saturated and muted. Yellows are left out:
  // their generated brand-700 is too light for white text in light mode, a palette issue.
  it.each(['#0000b3', '#2563eb', '#dc2626', '#16a34a', '#0d9488', '#7c3aed', '#db2777', '#64748b'])(
    'meets AA (4.5:1) in dark mode for a brand seeded with %s',
    (seed) => {
      const css = createBrand({ name: 'seeded', seed });
      const selector = "[data-theme='dark']";
      const fill = resolve(css, selector, '--color-text-accent');
      const text = resolve(css, selector, '--color-text-on-accent');
      expect(contrast(fill, text)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
