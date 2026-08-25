import { useEffect, useState } from 'react';
import { BRAND_NAMES, applyBrand, readStoredBrand, type BrandName } from '../brands';

/**
 * Swaps the token layer. Nothing about any component changes — only what the custom
 * properties beneath it resolve to.
 *
 * The brand is already applied by the time this mounts: an inline script in the head
 * sets the attribute before first paint. This only syncs the control to it, so there
 * is no flash of the default brand on navigation.
 *
 * Starlight renders this override twice (header and mobile nav), so instances stay in
 * step through a custom event.
 */
const SYNC_EVENT = 'ds:brandchange';

export function BrandSelect() {
  const [brand, setBrand] = useState<BrandName>('default');

  useEffect(() => {
    setBrand(readStoredBrand());

    const onSync = (event: Event) => setBrand((event as CustomEvent<BrandName>).detail);
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, []);

  return (
    <label className="ds-control ds-control-inline">
      {/* Reads the active brand's own token, so it is correct before hydration and
          cannot drift from the generated palettes. */}
      <span className="ds-swatch" aria-hidden="true" />
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
