import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxGroupProps, ComboboxGroupLabelProps } from '@arun-dev/headless/combobox';
import { cn } from '../../lib/cn';

/** Items under a label, as an `<optgroup>`. */
export function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <Headless.Group {...props} className={cn('combobox-group', className)} />;
}

/** The group's name, shown above its items; not an option. */
export function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return <Headless.GroupLabel {...props} className={cn('combobox-group-label', className)} />;
}
