import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Switch } from '@arun-dev/ui';

/**
 * `render` on the thumb, where `children` cannot help: the icon *is* the thumb rather
 * than sitting inside one.
 *
 * The icon component owns its root element, so it receives `className`, `aria-hidden`
 * and the `data-*` state directly — which is what lets it react to `data-checked`
 * itself, with no wrapper span in between.
 */
export default function SwitchThumbRender() {
  const [dark, setDark] = useState(false);

  return (
    <label className="ds-theme-toggle" htmlFor="theme-render">
      <Switch.Root id="theme-render" checked={dark} onCheckedChange={setDark}>
        <Switch.Thumb className="ds-icon-thumb" render={<ThemeIcon dark={dark} />} />
      </Switch.Root>
      {dark ? 'Dark' : 'Light'}
    </label>
  );
}

/**
 * Renders its own `<svg>` root and spreads everything it is given onto it — the same
 * shape as any icon component, or as `motion.span` from an animation library.
 *
 * The viewBox is larger than the artwork so the glyph keeps a margin inside the circle
 * the thumb draws; an `<svg>` has no padding of its own.
 */
function ThemeIcon({ dark, ...rest }: { dark: boolean } & ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" {...rest}>
      {dark ? (
        <path fill="currentColor" d="M25 20.2A9 9 0 1 1 15.8 11a7 7 0 0 0 9.2 9.2Z" />
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <circle cx="16" cy="16" r="4.5" />
          <path d="M16 6v2M16 24v2M9 9l1.5 1.5M21.5 21.5 23 23M6 16h2M24 16h2M9 23l1.5-1.5M21.5 10.5 23 9" />
        </g>
      )}
    </svg>
  );
}
