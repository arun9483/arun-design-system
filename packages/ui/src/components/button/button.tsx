import type React from 'react';
import { Button as Headless } from '@arun-dev/headless/button';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'ghost' | 'primary';

type ButtonOwnProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  /**
   * Convenience for the common case: when set, an `<a href>` is rendered instead of a
   * `<button>`. A control that navigates should be an anchor, so that middle-click,
   * cmd-click, the status bar and "link" in assistive technology all work.
   *
   * For anything else — a router link, a label — use `render`.
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

/**
 * Styling only. Focus, keyboard activation and `disabled` all come from
 * `@arun-dev/headless`, whatever element ends up being rendered.
 */
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

  // `href` is sugar for rendering a real anchor; the headless Button infers from it
  // that the element is not a native button. The anchor's content is this component's
  // children, merged onto it by useRender — not something the linter can see here.
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  const anchor = <a href={href} />;
  const element = render ?? (href !== undefined ? anchor : undefined);

  return (
    <Headless
      render={element}
      className={cn(variantClass, className)}
      // An anchor takes no `type`; it means something else there.
      type={href === undefined ? type : undefined}
      {...rest}
    >
      {children}
    </Headless>
  );
}
