/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { ARUN_BRAND, createBrand } from '../createBrand';
import arunCss from './arun.css?raw';

/* The published arun brand is createBrand(ARUN_BRAND), byte for byte, after its header comment.
   So an app importing @arun-dev/tokens/brands/arun and one calling createBrand(ARUN_BRAND) look
   the same, and a change to createBrand() cannot leave the published file behind: this fails
   until `pnpm --filter @arun-dev/tokens generate:brands` is run. */
describe('the arun brand', () => {
  it('is published exactly as createBrand(ARUN_BRAND) generates it', () => {
    const body = arunCss.replace(/^\/\*[\s\S]*?\*\/\n/, '');
    expect(body).toBe(createBrand(ARUN_BRAND));
  });

  it('comes from one seed colour', () => {
    expect(ARUN_BRAND).toEqual({ name: 'arun', seed: '#7c3aed' });
  });
});
