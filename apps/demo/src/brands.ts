/**
 * Brand switching.
 *
 * The default brand ships with @arun-dev/tokens and is imported as a normal
 * stylesheet in main.tsx. The alternates are generated from a single seed colour by
 * createBrand() (see scripts/generate-brands.mjs) and injected as a <style> element
 * when selected — their `:root` declarations come later in source order, so they win.
 *
 * Selecting "default" removes the element, falling back to the shipped brand.
 */
import forest from './generated/forest.css?raw';
import plum from './generated/plum.css?raw';
import sky from './generated/sky.css?raw';

export type BrandName = 'default' | 'sky' | 'forest' | 'plum';

export const BRANDS: Record<BrandName, { css: string | null; seed: string }> = {
  default: { css: null, seed: '#4f46e5' },
  sky: { css: sky, seed: '#0284c7' },
  forest: { css: forest, seed: '#059669' },
  plum: { css: plum, seed: '#9333ea' },
};

export const BRAND_NAMES = Object.keys(BRANDS) as BrandName[];

const STYLE_ID = 'demo-brand-override';

export function applyBrand(name: BrandName): void {
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
