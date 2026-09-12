import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';

/**
 * Button's own props. Everything else — `id`, `className`, `children`, `aria-*`,
 * `data-*`, event handlers — comes from React's own `<button>` props, so it is typed
 * and checked without being declared here.
 */
type ButtonOwnProps = {
  /**
   * Prevents activation. On a `<button>` the platform does it; on the `<a>` that
   * `href` renders, dropping the `href` does it — the DOM leaves an anchor without one
   * unfocusable, unactivatable and no longer a link.
   *
   * A `render` component cannot be inspected, so it gets `aria-disabled` and
   * `data-disabled` rather than `disabled`: actually disabling itself is up to it.
   */
  disabled?: boolean;
  /**
   * Renders an `<a href>` instead of a `<button>`.
   *
   * A control that navigates should be an anchor, so middle-click, cmd-click, the
   * status bar and "link" in assistive technology all work. It is a prop rather than
   * something to write on a `render` element because `disabled` has to be able to take
   * it away, and a `render` element's own props outrank everything.
   */
  href?: string;
  /**
   * Element or component to render instead of the default. Props, className, event
   * handlers and ref are merged onto it.
   *
   * @example <Button render={<NextLink href="/docs" />}>Docs</Button>
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ButtonOwnProps> &
  Pick<ComponentPropsWithRef<'a'>, 'target' | 'rel' | 'download'>;

/**
 * A button — behaviour only, no styling.
 *
 * Renders a `<button>`, or an `<a href>` when `href` is set. Both are natively
 * focusable and keyboard-activatable, so nothing here is synthesised: the component
 * picks the right element, defaults `type` so a button does not submit by accident,
 * and expresses `disabled` the way that element already understands.
 *
 * A disabled `href` renders a `<button disabled>` rather than a dead link — the
 * platform then removes it from the tab order and suppresses activation, with no
 * handler stripping or `tabindex` bookkeeping of our own.
 *
 * Emits `data-disabled` so one selector styles a disabled control either way.
 */
export function Button({
  disabled = false,
  href,
  type = 'button',
  className,
  children,
  render,
  ...rest
}: ButtonProps) {
  // A disabled link is not a link: it navigates nowhere, so it stops being an `<a>`
  // and becomes a `<button disabled>`, which the platform takes care of completely.
  const linksOut = href !== undefined && !disabled;

  // `type` and `disabled` only mean anything on a `<button>`, and `render` is the one
  // thing that can move us off one. An element literal says which it is; a component
  // cannot be inspected, so it is left to pass its own `type` if it needs one.
  const rendersButton = render === undefined ? !linksOut : render.type === 'button';

  if (process.env.NODE_ENV !== 'production' && disabled && render !== undefined) {
    const renderProps = render.props as { href?: unknown };
    if (renderProps?.href !== undefined) {
      console.error(
        'Button: `disabled` cannot remove the `href` on a `render` element — its own ' +
          'props outrank the component. Pass the URL as `href` on Button instead.',
      );
    }
  }

  const elementProps: UnknownProps = rendersButton
    ? { type, disabled: disabled || undefined }
    : { href: linksOut ? href : undefined, 'aria-disabled': disabled || undefined };

  return useRender({
    render,
    defaultTagName: linksOut ? 'a' : 'button',
    props: {
      ...elementProps,
      'data-disabled': disabled ? '' : undefined,
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });
}
