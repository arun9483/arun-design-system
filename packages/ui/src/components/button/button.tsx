import { Button as Headless } from '@arun-dev/headless/button';
import type { ButtonProps as HeadlessButtonProps } from '@arun-dev/headless/button';
import { cn } from '../../lib/cn';
import { Spinner } from '../spinner';

export type ButtonVariant = 'ghost' | 'primary' | 'danger' | 'danger-ghost';

export type ButtonProps = HeadlessButtonProps & {
  variant?: ButtonVariant;
};

/**
 * Styling only. The element, `type`, `disabled` and `pending` all come from
 * `@arun-dev/headless`.
 *
 * While `pending`, a Spinner turns over the label, which stays in place, unseen, so the
 * button keeps its width and its name.
 */
export function Button({
  variant = 'ghost',
  pending = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <Headless className={cn('btn', `btn-${variant}`, className)} pending={pending} {...rest}>
      {pending ? (
        <>
          <span className="btn-label">{children}</span>
          <Spinner className="btn-spinner" aria-hidden />
        </>
      ) : (
        children
      )}
    </Headless>
  );
}
