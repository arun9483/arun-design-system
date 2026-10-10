'use client';

import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxEmptyProps, ComboboxStatusProps } from '@arun-dev/headless/combobox';
import { cn } from '../../lib/cn';

/** "No results", shown when the filter leaves nothing and nothing is loading. */
export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return <Headless.Empty {...props} className={cn('combobox-message', className)} />;
}

/** A polite live region for "Searching…" or a result count. */
export function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
  return <Headless.Status {...props} className={cn('combobox-message', className)} />;
}
