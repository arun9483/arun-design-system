import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuRadioItemProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

export function MenuRadioItem({ className, ...props }: MenuRadioItemProps) {
  return <Headless.RadioItem {...props} className={cn('menu-item', className)} />;
}
