import { useEffect, useState } from 'react';
import { BRANDS, BRAND_NAMES, applyBrand, readStoredBrand, type BrandName } from '../brands';

/**
 * Swaps the token layer. Nothing about any component changes — only what the custom
 * properties beneath it resolve to.
 *
 * Starlight renders this override twice (header and mobile nav), so instances sync
 * through a custom event rather than drifting apart.
 */
const SYNC_EVENT = 'ds:brandchange';

export function BrandSelect() {
  const [brand, setBrand] = useState<BrandName>('default');

  useEffect(() => {
    const stored = readStoredBrand();
    setBrand(stored);
    applyBrand(stored);

    const onSync = (event: Event) => setBrand((event as CustomEvent<BrandName>).detail);
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, []);

  return (
    <label className="ds-control ds-control-inline">
      <span className="ds-swatch" style={{ background: BRANDS[brand].seed }} aria-hidden="true" />
      <select
        aria-label="Brand"
        title="Swap the design token layer"
        value={brand}
        onChange={(event) => {
          const next = event.target.value as BrandName;
          setBrand(next);
          applyBrand(next);
          window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
        }}
      >
        {BRAND_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
