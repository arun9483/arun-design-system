import { useState } from 'react';
import { Switch } from '@arun-dev/ui';

/**
 * A thumb with an icon in it — the reason `Switch.Thumb` is a real element rather
 * than a pseudo-element. The icon swaps with the state the Root already tracks.
 */
export default function SwitchThemeToggle() {
  const [dark, setDark] = useState(false);

  return (
    <label className="ds-theme-toggle" htmlFor="theme">
      <Switch.Root id="theme" checked={dark} onCheckedChange={setDark}>
        <Switch.Thumb className="ds-theme-thumb">{dark ? <Moon /> : <Sun />}</Switch.Thumb>
      </Switch.Root>
      {dark ? 'Dark' : 'Light'}
    </label>
  );
}

/* Presentational only. The Root announces the state and the thumb is aria-hidden, so
   the icons never reach assistive technology — they are not a second source of truth. */

function Sun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 13.2A9 9 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2Z" />
    </svg>
  );
}
