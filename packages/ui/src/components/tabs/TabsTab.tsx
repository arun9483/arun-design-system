import { Tabs as Headless } from '@arun-dev/headless/tabs';
import type { TabsTabProps } from '@arun-dev/headless/tabs';
import { cn } from '../../lib/cn';

export function TabsTab({ className, ...props }: TabsTabProps) {
  return <Headless.Tab {...props} className={cn('tabs-tab', className)} />;
}
