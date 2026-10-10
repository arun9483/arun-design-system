'use client';

import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxItemProps } from '@arun-dev/headless/combobox';
import { cn } from '../../lib/cn';

/** One option, with a check shown while it is selected. */
export function ComboboxItem<T = unknown>({ className, children, ...props }: ComboboxItemProps<T>) {
  return (
    <Headless.Item<T> {...props} className={cn('combobox-item', className)}>
      <svg className="combobox-item-check" viewBox="0 0 16 16" aria-hidden>
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      {children}
    </Headless.Item>
  );
}
