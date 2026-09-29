import { Tooltip as Headless } from '@arun-dev/headless/tooltip';
import type { TooltipPopupProps } from '@arun-dev/headless/tooltip';
import { cn } from '../../lib/cn';

/** The label. Placement, timing and all behaviour come from @arun-dev/headless. */
export function TooltipPopup({ className, ...props }: TooltipPopupProps) {
  return <Headless.Popup {...props} className={cn('tooltip', className)} />;
}
