'use client';

import { Tabs as Headless } from '@arun-dev/headless/tabs';
import type { TabsPanelProps } from '@arun-dev/headless/tabs';
import { cn } from '../../lib/cn';

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <Headless.Panel {...props} className={cn('tabs-panel', className)} />;
}
