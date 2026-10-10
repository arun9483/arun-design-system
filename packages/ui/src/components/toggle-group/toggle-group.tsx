'use client';

import { ToggleGroup as Headless } from '@arun-dev/headless/toggle-group';
import type { ToggleGroupProps } from '@arun-dev/headless/toggle-group';
import { cn } from '../../lib/cn';

/** Toggles sharing one value, in a frame. Name it with `aria-label`. */
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <Headless {...props} className={cn('toggle-group', className)} />;
}
