import { Menu as Headless } from '@arun-dev/headless/menu';
import type {
  MenuGroupLabelProps,
  MenuGroupProps,
  MenuRadioGroupProps,
} from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

/** Stacks its items as the popup does: inside a plain block, buttons would shrink to fit. */
export function MenuGroup({ className, ...props }: MenuGroupProps) {
  return <Headless.Group {...props} className={cn('menu-group', className)} />;
}

export function MenuRadioGroup({ className, ...props }: MenuRadioGroupProps) {
  return <Headless.RadioGroup {...props} className={cn('menu-group', className)} />;
}

export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return <Headless.GroupLabel {...props} className={cn('menu-group-label', className)} />;
}
