/**
 * Brand switching.
 *
 * Every brand ships in the CSS bundle, scoped under `[data-brand]`. Switching sets
 * one attribute on `<html>`, so an inline script can restore the stored choice
 * before first paint — see the `head` entry in astro.config.mjs.
 *
 * The default brand is the unscoped `:root` layer from @arun-dev/tokens, so
 * selecting it just removes the attribute.
 */
export type BrandName = 'default' | 'sky' | 'forest' | 'plum';

export const BRAND_NAMES: BrandName[] = ['default', 'sky', 'forest', 'plum'];

export const STORAGE_KEY = 'ds-brand';

export function readStoredBrand(): BrandName {
  if (typeof document === 'undefined') return 'default';

  // The inline script already applied it; trust the DOM over storage.
  const applied = document.documentElement.dataset.brand;
  if (applied && (BRAND_NAMES as string[]).includes(applied)) return applied as BrandName;

  return 'default';
}

export function applyBrand(name: BrandName): void {
  if (typeof document === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // Private browsing or storage disabled — switching still works for this page.
  }

  if (name === 'default') delete document.documentElement.dataset.brand;
  else document.documentElement.dataset.brand = name;
}
