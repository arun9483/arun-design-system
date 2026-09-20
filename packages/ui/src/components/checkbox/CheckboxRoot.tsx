import { Checkbox as Headless } from '@arun-dev/headless/checkbox';
import type { CheckboxRootProps } from '@arun-dev/headless/checkbox';
import { cn } from '../../lib/cn';

/** The box. All behaviour comes from @arun-dev/headless; this adds only styling. */
export function CheckboxRoot({ className, ...props }: CheckboxRootProps) {
  return <Headless.Root {...props} className={cn('checkbox', className)} />;
}
