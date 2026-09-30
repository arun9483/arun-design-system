import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuItemProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

export function MenuItem({ className, ...props }: MenuItemProps) {
  return <Headless.Item {...props} className={cn('menu-item', className)} />;
}
