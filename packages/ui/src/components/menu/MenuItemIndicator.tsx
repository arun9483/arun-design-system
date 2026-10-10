'use client';

import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuItemIndicatorProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

/**
 * Where the check goes, in a CheckboxItem or a RadioItem. Ships a checkmark — the opinion
 * `@arun-dev/headless` does not have — shown by `menu.css` off the item's `data-checked`, and
 * kept in the layout when unchecked so labels line up. Passing children replaces it.
 */
export function MenuItemIndicator({ className, children, ...props }: MenuItemIndicatorProps) {
  return (
    <Headless.ItemIndicator {...props} className={cn('menu-item-indicator', className)}>
      {children ?? (
        <svg className="menu-item-mark" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Headless.ItemIndicator>
  );
}
