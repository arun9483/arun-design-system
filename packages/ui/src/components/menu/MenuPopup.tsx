import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuPopupProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

/** The list. Placement, keyboard and all behaviour come from @arun-dev/headless. */
export function MenuPopup({ className, ...props }: MenuPopupProps) {
  return <Headless.Popup {...props} className={cn('menu', className)} />;
}
