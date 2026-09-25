import { RadioGroup as Headless } from '@arun-dev/headless/radio-group';
import type { RadioGroupRootProps } from '@arun-dev/headless/radio-group';
import { cn } from '../../lib/cn';

/** The group. All behaviour comes from @arun-dev/headless; this adds only layout. */
export function RadioGroupRoot({ className, ...props }: RadioGroupRootProps) {
  return <Headless.Root {...props} className={cn('radio-group', className)} />;
}
