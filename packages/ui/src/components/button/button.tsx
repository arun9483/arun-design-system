import type React from 'react';
import { useRender } from '../../internal/useRender';

type ButtonVariant = 'ghost' | 'primary';

type ButtonOwnProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  /**
   * Convenience for the common case: when set, a `<a href>` is rendered instead of
   * a `<button>`. For anything else — a router link, a label, a div — use `render`.
   */
  href?: string;
  /**
   * Element or component to render instead of the default. Props, className, event
   * handlers and ref are merged onto it.
   *
   * @example <Button render={<NextLink href="/docs" />}>Docs</Button>
   */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

type ButtonProps = ButtonOwnProps &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof ButtonOwnProps | 'children' | 'type'> & {
    type?: 'button' | 'submit' | 'reset';
  };

export function Button({
  variant = 'ghost',
  className,
  children,
  href,
  render,
  type,
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-ghost';

  // A bare <button> needs an explicit type so it does not default to submit.
  // An anchor, or any element supplied via `render`, must not receive one.
  const isPlainButton = render === undefined && href === undefined;
  const ownProps = isPlainButton
    ? { type: type ?? 'button' }
    : href !== undefined
      ? { href }
      : type
        ? { type }
        : undefined;

  return useRender({
    render,
    defaultTagName: href !== undefined ? 'a' : 'button',
    props: [{ className: variantClass }, ownProps, rest, { className, children }],
  });
}
