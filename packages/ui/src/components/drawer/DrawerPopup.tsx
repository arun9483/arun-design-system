import { Drawer as Headless } from '@arun-dev/headless/drawer';
import type { DrawerPopupProps } from '@arun-dev/headless/drawer';
import { cn } from '../../lib/cn';

/** The panel at an edge, and its backdrop. All behaviour comes from @arun-dev/headless. */
export function DrawerPopup({ className, ...props }: DrawerPopupProps) {
  return <Headless.Popup {...props} className={cn('drawer', className)} />;
}
