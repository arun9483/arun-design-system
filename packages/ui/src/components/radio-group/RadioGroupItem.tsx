import { RadioGroup as Headless } from '@arun-dev/headless/radio-group';
import type { RadioGroupItemProps } from '@arun-dev/headless/radio-group';
import { cn } from '../../lib/cn';

/**
 * The radio — a native `<input type="radio">`, restyled. The dot is a `::before` drawn by
 * `radio-group.css`, so there is no indicator part to render.
 */
export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return <Headless.Item {...props} className={cn('radio', className)} />;
}
