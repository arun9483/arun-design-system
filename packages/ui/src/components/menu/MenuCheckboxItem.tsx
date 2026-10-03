import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuCheckboxItemProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

export function MenuCheckboxItem({ className, ...props }: MenuCheckboxItemProps) {
  return <Headless.CheckboxItem {...props} className={cn('menu-item', className)} />;
}
