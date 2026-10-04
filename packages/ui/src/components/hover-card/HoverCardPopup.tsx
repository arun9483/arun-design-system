import { HoverCard as Headless } from '@arun-dev/headless/hover-card';
import type { HoverCardPopupProps } from '@arun-dev/headless/hover-card';
import { cn } from '../../lib/cn';

/** The card. Placement, timing and all behaviour come from @arun-dev/headless. */
export function HoverCardPopup({ className, ...props }: HoverCardPopupProps) {
  return <Headless.Popup {...props} className={cn('hover-card', className)} />;
}
