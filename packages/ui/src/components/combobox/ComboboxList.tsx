import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxListProps } from '@arun-dev/headless/combobox';
import { cn } from '../../lib/cn';

export function ComboboxList<T = unknown>({ className, ...props }: ComboboxListProps<T>) {
  return <Headless.List<T> {...props} className={cn('combobox-list', className)} />;
}
