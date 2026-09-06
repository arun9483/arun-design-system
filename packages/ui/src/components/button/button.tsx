import { Button as Headless } from '@arun-dev/headless/button';
import type { ButtonProps as HeadlessButtonProps } from '@arun-dev/headless/button';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'ghost' | 'primary';

export type ButtonProps = HeadlessButtonProps & {
  variant?: ButtonVariant;
};

/**
 * Styling only. The element choice, `type`, `href` and `disabled` all come from
 * `@arun-dev/headless`.
 */
export function Button({ variant = 'ghost', className, ...rest }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';

  return <Headless className={cn(variantClass, className)} {...rest} />;
}
