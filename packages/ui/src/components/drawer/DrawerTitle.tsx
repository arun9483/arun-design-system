'use client';

import type { ComponentProps } from 'react';
import { Drawer as Headless } from '@arun-dev/headless/drawer';
import { cn } from '../../lib/cn';

export function DrawerTitle({ className, ...props }: ComponentProps<typeof Headless.Title>) {
  return <Headless.Title {...props} className={cn('drawer-title', className)} />;
}
