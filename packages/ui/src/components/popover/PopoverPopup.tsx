import { Popover as Headless } from '@arun-dev/headless/popover';
import type { PopoverPopupProps } from '@arun-dev/headless/popover';
import { cn } from '../../lib/cn';

/** The panel. Placement and all behaviour come from @arun-dev/headless. */
export function PopoverPopup({ className, ...props }: PopoverPopupProps) {
  return <Headless.Popup {...props} className={cn('popover', className)} />;
}
