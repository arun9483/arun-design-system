'use client';

import { Dialog as Headless } from '@arun-dev/headless/dialog';
import type { DialogPopupProps } from '@arun-dev/headless/dialog';
import { cn } from '../../lib/cn';

/** The panel and its backdrop. All behaviour comes from @arun-dev/headless. */
export function DialogPopup({ className, ...props }: DialogPopupProps) {
  return <Headless.Popup {...props} className={cn('dialog', className)} />;
}
