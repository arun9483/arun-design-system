'use client';

import { Dialog as Headless } from '@arun-dev/headless/dialog';
import type { DialogTitleProps } from '@arun-dev/headless/dialog';
import { cn } from '../../lib/cn';

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <Headless.Title {...props} className={cn('dialog-title', className)} />;
}
