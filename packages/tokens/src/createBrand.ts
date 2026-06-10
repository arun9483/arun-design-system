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
    '--color-status-info': 'var(--color-brand-500)',
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
    '--color-text-on-accent': 'var(--color-neutral-0)',
    '--color-border-default': 'var(--color-neutral-700)',
    '--color-border-subtle': 'var(--color-neutral-800)',
    '--color-border-strong': 'var(--color-neutral-600)',
    '--color-border-accent': 'var(--color-brand-700)',
    ...STATUS_DARK,
    '--color-status-info': 'var(--color-brand-300)',
    '--color-status-info-bg': 'var(--color-brand-950)',
  };
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
  const palette = 'seed' in input ? generatePaletteFromSeed(input.seed) : input.palette;

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
