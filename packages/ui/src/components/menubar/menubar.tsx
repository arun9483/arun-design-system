'use client';

import { Menubar as Headless } from '@arun-dev/headless/menubar';
import type {
  MenubarRootProps,
  MenubarTriggerProps,
  MenubarPopupProps,
} from '@arun-dev/headless/menubar';
import { cn } from '../../lib/cn';

export function MenubarRoot({ className, ...props }: MenubarRootProps) {
  return <Headless.Root {...props} className={cn('menubar', className)} />;
}

export function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return <Headless.Trigger {...props} className={cn('menubar-trigger', className)} />;
}

/** A menu of the bar: styled as Menu's list. Placement and keys come from @arun-dev/headless. */
export function MenubarPopup({ className, ...props }: MenubarPopupProps) {
  return <Headless.Popup {...props} className={cn('menu', className)} />;
}
