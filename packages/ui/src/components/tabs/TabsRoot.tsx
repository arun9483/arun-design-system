import { Tabs as Headless } from '@arun-dev/headless/tabs';
import type { TabsRootProps } from '@arun-dev/headless/tabs';
import { cn } from '../../lib/cn';

/** Styling only: selection, keyboard and ARIA all come from @arun-dev/headless. */
export function TabsRoot({ className, ...props }: TabsRootProps) {
  return <Headless.Root {...props} className={cn('tabs', className)} />;
}
