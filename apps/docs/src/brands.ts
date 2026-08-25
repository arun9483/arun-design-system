import forest from './generated/forest.css?raw';
import plum from './generated/plum.css?raw';
import sky from './generated/sky.css?raw';

/**
 * Brand switching.
 *
 * The default brand ships with @arun-dev/tokens and loads as a normal stylesheet.
 * The alternates are generated from a single seed colour by createBrand() at build
 * time and injected as a <style> element when selected — their `:root` declarations
 * come later in source order, so they win. Selecting "default" removes the element.
 */
export type BrandName = 'default' | 'sky' | 'forest' | 'plum';

export const BRANDS: Record<BrandName, { css: string | null; seed: string }> = {
  default: { css: null, seed: '#4f46e5' },
  sky: { css: sky, seed: '#0284c7' },
  forest: { css: forest, seed: '#059669' },
  plum: { css: plum, seed: '#9333ea' },
};

export const BRAND_NAMES = Object.keys(BRANDS) as BrandName[];

const STYLE_ID = 'ds-brand-override';
const STORAGE_KEY = 'ds-brand';

export function readStoredBrand(): BrandName {
  if (typeof localStorage === 'undefined') return 'default';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && stored in BRANDS ? (stored as BrandName) : 'default';
}

export function applyBrand(name: BrandName): void {
  if (typeof document === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, name);

  const existing = document.getElementById(STYLE_ID);
  const { css } = BRANDS[name];

  if (css === null) {
    existing?.remove();
    return;
  }

  const style = existing ?? document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  if (!existing) document.head.append(style);
}
