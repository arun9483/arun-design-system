import { Switch as Headless } from '@arun-dev/headless/switch';
import type { SwitchThumbProps } from '@arun-dev/headless/switch';
import { cn } from '../../../lib/cn';

/** The moving part. Positioned by CSS keyed off the data-* attributes Root emits. */
export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  return <Headless.Thumb {...props} className={cn('switch-thumb', className)} />;
}
