import { Switch as Headless } from '@arun-dev/headless/switch';
import type { SwitchRootProps } from '@arun-dev/headless/switch';
import { cn } from '../../../lib/cn';

/** The track. All behaviour comes from @arun-dev/headless; this adds only styling. */
export function SwitchRoot({ className, ...props }: SwitchRootProps) {
  return <Headless.Root {...props} className={cn('switch', className)} />;
}
