/**
 * createBrand — build-time CSS generator for @arun-dev/tokens.
 *
 * Usage (full palette):
 *   import { createBrand } from '@arun-dev/tokens/createBrand';
 *   const css = createBrand({ name: 'acme', palette: { 50: '#...', ..., 950: '#...' } });
 *   writeFileSync('src/brands/acme.css', css);
 *
 * Usage (seed color — auto-generates palette):
 *   const css = createBrand({ name: 'acme', seed: '#7c3aed' });
 *
 * Consumer-level brand completion:
 *   A consumer may skip createBrand entirely and define semantic tokens directly in their globals.css.
 *   The only requirement: all semantic variables listed in BrandSemanticContract must be defined
 *   before @arun-dev/ui components are rendered.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
type NeutralShade = 0 | Shade;

export type BrandPalette = Record<Shade, string>;
export type NeutralPalette = Record<NeutralShade, string>;

type WithPalette = { palette: BrandPalette };
type WithSeed = { seed: string };

export type CreateBrandInput = {
  /** Brand identifier — used as a comment label in generated CSS */
  name: string;
  /** Optional neutral/gray palette. Defaults to cool-gray (slate). */
  neutral?: NeutralPalette;
} & (WithPalette | WithSeed);

// ─── Default neutral (cool-gray / slate) ─────────────────────────────────────

export const DEFAULT_NEUTRAL: NeutralPalette = {
  0: '#ffffff',
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#96a5ba' /* nudged +2 per channel → 7.13:1 on neutral-900 (AAA) */,
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// ─── Color math (HSL, no external deps) ──────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** WCAG 2 relative luminance of a #rrggbb colour. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two #rrggbb colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Lightness targets for each shade step */
const SHADE_LIGHTNESS: Record<Shade, number> = {
  50: 97,
  100: 93,
  200: 86,
  300: 75,
  400: 64,
  500: 53,
  600: 44,
  700: 36,
  800: 28,
  900: 20,
  950: 14,
};

/**
 * Generate an 11-step palette from a seed hex color.
 * Uses HSL color space — perceptually approximate but dependency-free.
 */
export function generatePaletteFromSeed(seed: string): BrandPalette {
  const [r, g, b] = hexToRgb(seed);
  const [h, s] = rgbToHsl(r, g, b);

  const entries = (Object.entries(SHADE_LIGHTNESS) as [string, number][]).map(
    ([shade, targetL]) => {
      const adjustedS = targetL > 80 ? s * 0.55 : targetL < 25 ? s * 0.75 : s;
      return [Number(shade), hslToHex(h, Math.min(adjustedS, 100), targetL)];
    },
  );
  return Object.fromEntries(entries) as BrandPalette;
}

// ─── Semantic derivation ──────────────────────────────────────────────────────

/**
 * BrandSemanticContract — the full set of CSS variables @arun-dev/ui expects.
 * Consumers who skip createBrand must define all of these in their own CSS.
 */
export type BrandSemanticContract = {
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-surface': string;
  '--color-bg-accent': string;
  '--color-bg-inverse': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-text-muted': string;
  '--color-text-accent': string;
  '--color-text-inverse': string;
  '--color-text-on-accent': string;
  '--color-border-default': string;
  '--color-border-subtle': string;
  '--color-border-strong': string;
  '--color-border-accent': string;
  '--color-status-success': string;
  '--color-status-success-bg': string;
  '--color-status-error': string;
  '--color-status-error-bg': string;
  '--color-status-warning': string;
  '--color-status-warning-bg': string;
  '--color-status-info': string;
  '--color-status-info-bg': string;
};

const STATUS_LIGHT: Pick<
  BrandSemanticContract,
  | '--color-status-success'
  | '--color-status-success-bg'
  | '--color-status-error'
  | '--color-status-error-bg'
  | '--color-status-warning'
  | '--color-status-warning-bg'
> = {
  '--color-status-success': '#15803d',
  '--color-status-success-bg': '#f0fdf4',
  '--color-status-error': '#b91c1c',
  '--color-status-error-bg': '#fef2f2',
  '--color-status-warning': '#b45309',
  '--color-status-warning-bg': '#fffbeb',
};

const STATUS_DARK = {
  '--color-status-success': '#4ade80',
  '--color-status-success-bg': '#052e16',
  '--color-status-error': '#f87171',
  '--color-status-error-bg': '#450a0a',
  '--color-status-warning': '#fbbf24',
  '--color-status-warning-bg': '#451a03',
};

/* deriveLight/deriveDark must stay in sync with src/brands/default/semantic.css — the
   hand-audited source of truth (AAA contrast). Guarded by createBrand.unit.spec.ts. */
function deriveLight(): Record<string, string> {
  return {
    '--color-bg-primary': 'var(--color-neutral-0)',
    '--color-bg-secondary': 'var(--color-neutral-50)',
    '--color-bg-surface': 'var(--color-neutral-100)',
    '--color-bg-accent': 'var(--color-brand-50)',
    '--color-bg-inverse': 'var(--color-neutral-900)',
    '--color-text-primary': 'var(--color-neutral-900)',
    '--color-text-secondary': 'var(--color-neutral-700)',
    '--color-text-muted': 'var(--color-neutral-600)',
    '--color-text-accent': 'var(--color-brand-700)',
    '--color-text-inverse': 'var(--color-neutral-50)',
    '--color-text-on-accent': 'var(--color-neutral-0)',
    '--color-border-default': 'var(--color-neutral-200)',
    '--color-border-subtle': 'var(--color-neutral-100)',
    '--color-border-strong': 'var(--color-neutral-300)',
    '--color-border-accent': 'var(--color-brand-300)',
    ...STATUS_LIGHT,
    // 600, not 500: the info Badge's text sits on brand-50, and 500 there was 3.99:1.
    '--color-status-info': 'var(--color-brand-600)',
    '--color-status-info-bg': 'var(--color-brand-50)',
  };
}

function deriveDark(): Record<string, string> {
  return {
    '--color-bg-primary': 'var(--color-neutral-900)',
    '--color-bg-secondary': 'var(--color-neutral-800)',
    '--color-bg-surface': 'var(--color-neutral-700)',
    '--color-bg-accent': 'var(--color-brand-950)',
    '--color-bg-inverse': 'var(--color-neutral-50)',
    '--color-text-primary': 'var(--color-neutral-100)',
    '--color-text-secondary': 'var(--color-neutral-300)',
    '--color-text-muted': 'var(--color-neutral-400)',
    '--color-text-accent': 'var(--color-brand-300)',
    '--color-text-inverse': 'var(--color-neutral-900)',
    // The accent is light in dark mode, so the text on it is dark.
    '--color-text-on-accent': 'var(--color-neutral-950)',
    '--color-border-default': 'var(--color-neutral-700)',
    '--color-border-subtle': 'var(--color-neutral-800)',
    '--color-border-strong': 'var(--color-neutral-600)',
    '--color-border-accent': 'var(--color-brand-700)',
    ...STATUS_DARK,
    '--color-status-info': 'var(--color-brand-300)',
    '--color-status-info-bg': 'var(--color-brand-950)',
  };
}

// ─── Contrast ─────────────────────────────────────────────────────────────────

/**
 * Every pairing of semantic tokens that @arun-dev/ui draws one on the other, with the WCAG
 * contrast it needs: 7 where the default brand is audited AAA, 4.5 for other text, 3 for
 * icons, accent bars and focus outlines. A brand that skips createBrand should meet these too.
 */
export const CONTRAST_REQUIREMENTS: readonly {
  foreground: keyof BrandSemanticContract;
  background: keyof BrandSemanticContract;
  min: number;
}[] = [
  // Body text on every page surface.
  { foreground: '--color-text-primary', background: '--color-bg-primary', min: 7 },
  { foreground: '--color-text-primary', background: '--color-bg-secondary', min: 7 },
  { foreground: '--color-text-primary', background: '--color-bg-surface', min: 4.5 },
  { foreground: '--color-text-secondary', background: '--color-bg-primary', min: 7 },
  { foreground: '--color-text-muted', background: '--color-bg-primary', min: 4.5 },
  { foreground: '--color-text-inverse', background: '--color-bg-inverse', min: 7 },
  // A selected row: a TreeView Item's text on its tint.
  { foreground: '--color-text-primary', background: '--color-bg-accent', min: 7 },
  // The accent as text: links, accent chips, focus outlines.
  { foreground: '--color-text-accent', background: '--color-bg-primary', min: 7 },
  { foreground: '--color-text-accent', background: '--color-bg-secondary', min: 4.5 },
  { foreground: '--color-text-accent', background: '--color-bg-surface', min: 4.5 },
  { foreground: '--color-text-accent', background: '--color-bg-accent', min: 4.5 },
  // The accent as a fill: primary Button, checked Checkbox and Radio, the current page.
  { foreground: '--color-text-on-accent', background: '--color-text-accent', min: 7 },
  // Status tones: a Badge's text on its tint, an Alert's or Toast's accent on the page.
  { foreground: '--color-status-success', background: '--color-status-success-bg', min: 4.5 },
  { foreground: '--color-status-error', background: '--color-status-error-bg', min: 4.5 },
  { foreground: '--color-status-warning', background: '--color-status-warning-bg', min: 4.5 },
  { foreground: '--color-status-info', background: '--color-status-info-bg', min: 4.5 },
  { foreground: '--color-status-info', background: '--color-bg-primary', min: 3 },
  // Calendar day tags: a holiday's number as text, the other marks as shapes on the page.
  { foreground: '--color-status-error', background: '--color-bg-primary', min: 4.5 },
  { foreground: '--color-status-warning', background: '--color-bg-primary', min: 3 },
  { foreground: '--color-status-success', background: '--color-bg-primary', min: 3 },
];

const BRAND_VAR = /^var\(--color-brand-(\d+)\)$/;
const NEUTRAL_VAR = /^var\(--color-neutral-(\d+)\)$/;

/** The colour a semantic value stands for: a brand shade, a neutral shade or a literal. */
function resolveColor(value: string, palette: BrandPalette, neutral: NeutralPalette): string {
  const brand = BRAND_VAR.exec(value);
  if (brand) return palette[Number(brand[1]) as Shade];
  const gray = NEUTRAL_VAR.exec(value);
  if (gray) return neutral[Number(gray[1]) as NeutralShade];
  return value;
}

/** The same colour, lighter or darker by `step` HSL points; its hue and saturation kept. */
function shiftLightness(hex: string, step: number): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  return hslToHex(h, s, Math.min(100, Math.max(0, l + step)));
}

const SHADES = Object.keys(SHADE_LIGHTNESS).map(Number) as Shade[];

/**
 * Moves the shades of a seeded palette until every pairing in CONTRAST_REQUIREMENTS passes in
 * both themes. HSL lightness is not how light a colour looks — a yellow at the 700 step is
 * still bright — so fixed steps alone cannot promise contrast.
 *
 * In each failing pair the brand shade moves, away from the colour it sits on or under: the
 * foreground's when both are brand shades. Hue and saturation stay, so the brand still reads
 * as its seed. The scale is then kept in order, light to dark, by moving its neighbours on.
 */
function fitContrast(palette: BrandPalette, neutral: NeutralPalette): BrandPalette {
  const fitted = { ...palette };
  const themes = [deriveLight(), deriveDark()];

  for (let pass = 0; pass < 4; pass++) {
    let moved = false;
    for (const theme of themes) {
      for (const { foreground, background, min } of CONTRAST_REQUIREMENTS) {
        const fgValue = theme[foreground] ?? '';
        const bgValue = theme[background] ?? '';
        const fgShade = BRAND_VAR.exec(fgValue)?.[1];
        const bgShade = BRAND_VAR.exec(bgValue)?.[1];
        const shade = Number(fgShade ?? bgShade) as Shade;
        if (!fgShade && !bgShade) continue;
        const other = resolveColor(fgShade ? bgValue : fgValue, fitted, neutral);
        // Away from the other colour: darker against a light one, lighter against a dark one.
        const step = relativeLuminance(other) > 0.18 ? -1 : 1;
        for (let i = 0; i < 100 && contrastRatio(fitted[shade], other) < min; i++) {
          fitted[shade] = shiftLightness(fitted[shade], step);
          moved = true;
        }
      }
    }
    // Keep the scale in order: each shade darker than the one before it.
    const middle = SHADES.indexOf(500);
    for (let i = middle + 1; i < SHADES.length; i++) {
      const [before, shade] = [SHADES[i - 1] as Shade, SHADES[i] as Shade];
      for (
        let n = 0;
        n < 100 && relativeLuminance(fitted[shade]) >= relativeLuminance(fitted[before]);
        n++
      ) {
        fitted[shade] = shiftLightness(fitted[shade], -1);
      }
    }
    for (let i = middle - 1; i >= 0; i--) {
      const [after, shade] = [SHADES[i + 1] as Shade, SHADES[i] as Shade];
      for (
        let n = 0;
        n < 100 && relativeLuminance(fitted[shade]) <= relativeLuminance(fitted[after]);
        n++
      ) {
        fitted[shade] = shiftLightness(fitted[shade], 1);
      }
    }
    if (!moved) break;
  }
  return fitted;
}

// ─── CSS generation ───────────────────────────────────────────────────────────

function toVars(tokens: Record<string, string>, indent = '  '): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join('\n');
}

function paletteVars(palette: BrandPalette): string {
  return (Object.keys(SHADE_LIGHTNESS) as unknown as Shade[])
    .map((shade) => `  --color-brand-${shade}: ${palette[shade]};`)
    .join('\n');
}

function neutralVars(neutral: NeutralPalette): string {
  return ([0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as NeutralShade[])
    .map((shade) => `  --color-neutral-${shade}: ${neutral[shade]};`)
    .join('\n');
}

/**
 * Generate a complete brand CSS string from a palette or seed color.
 * Write the output to a .css file and import it in your globals.css.
 */
export function createBrand(input: CreateBrandInput): string {
  const { name, neutral = DEFAULT_NEUTRAL } = input;
  // A seeded palette is fitted to the contrast requirements. A palette passed in is the
  // consumer's own choice and is used as given: check it against CONTRAST_REQUIREMENTS.
  const palette =
    'seed' in input ? fitContrast(generatePaletteFromSeed(input.seed), neutral) : input.palette;

  const light = deriveLight();
  const dark = deriveDark();

  return `/* ${name} brand — generated by createBrand (@arun-dev/tokens) */
/* Re-run createBrand to regenerate after palette changes.        */

:root {
${paletteVars(palette)}

${neutralVars(neutral)}

${toVars(light)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${toVars(dark, '    ')}
  }
}

[data-theme='dark'] {
${toVars(dark)}
}

[data-theme='light'] {
${toVars(light)}
}
`;
}

export { ARUN_BRAND } from './brands/arun';
