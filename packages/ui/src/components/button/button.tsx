import type React from 'react';
import { cloneElement } from 'react';
import { retractActivationProps, useButton, useRender } from '@arun-dev/headless';

export type ButtonVariant = 'ghost' | 'primary';

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

export type ButtonProps = ButtonOwnProps &
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
  disabled,
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

  // Only a real <button> gets disabled semantics from the platform. Anything else —
  // an anchor, or whatever `render` supplies — needs them synthesised.
  const isNativeButton = href === undefined && (render === undefined || render.type === 'button');
  const elementProps = useButton({
    disabled,
    native: isNativeButton,
    props: { ...ownProps, ...rest },
  });

  // A `render` element's own props merge last, so an href written directly on it
  // outranks anything useButton returns. Retract it on the element instead.
  const safeRender =
    disabled && !isNativeButton && render !== undefined
      ? cloneElement(render, retractActivationProps(render.props as Record<string, unknown>))
      : render;

  return useRender({
    render: safeRender,
    defaultTagName: href !== undefined ? 'a' : 'button',
    props: [{ className: variantClass }, elementProps, { className, children }],
  });
}
