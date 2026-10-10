'use client';

import { useSyncExternalStore } from 'react';
import { today } from './dates';

const subscribe = () => () => {};

/** The locale to name dates in, and the first day of its week. */
const browserLocale = () => new Intl.DateTimeFormat().resolvedOptions().locale;

/**
 * `locale`, or else the browser's. A server has no browser: it renders in `en-US`, and the
 * hydrating client re-renders in the browser's locale rather than keeping the server's names
 * on its attributes, which React does not repair.
 */
export function useLocale(locale: string | undefined): string {
  const resolved = useSyncExternalStore(subscribe, browserLocale, () => 'en-US');
  return locale ?? resolved;
}

/** Today on the device, or `null` on the server, which does not know the user's time zone. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, today, () => null);
}
