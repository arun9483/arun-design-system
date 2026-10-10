'use client';

import { Toggle as Headless } from '@arun-dev/headless/toggle';
import type { ToggleProps } from '@arun-dev/headless/toggle';
import { cn } from '../../lib/cn';

/** A button that stays pressed. In a ToggleGroup, give it a `value`. */
export function Toggle({ className, ...props }: ToggleProps) {
  return <Headless {...props} className={cn('toggle', className)} />;
}
