'use client';

import { Tabs as Headless } from '@arun-dev/headless/tabs';
import type { TabsListProps } from '@arun-dev/headless/tabs';
import { cn } from '../../lib/cn';

export function TabsList({ className, ...props }: TabsListProps) {
  return <Headless.List {...props} className={cn('tabs-list', className)} />;
}
