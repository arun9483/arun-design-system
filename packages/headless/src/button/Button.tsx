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
   * Prevents activation. On a `<button>` the platform does it.
   *
   * A `render` component cannot be inspected, so it gets `aria-disabled` and
   * `data-disabled` rather than `disabled`: actually disabling itself is up to it.
   */
  disabled?: boolean;
  /**
   * Element or component to render instead of the default. Props, className, event
   * handlers and ref are merged onto it.
   *
   * @example <Button render={<motion.button />}>Save</Button>
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ButtonOwnProps>;

/**
 * A button — behaviour only, no styling.
 *
 * Renders a `<button>`, which is natively focusable and keyboard-activatable, so
 * nothing here is synthesised: the component defaults `type` so it does not submit by
 * accident, and expresses `disabled` the way the element already understands.
 *
 * Navigation is not a button's job — a link belongs to a separate `Link` component.
 *
 * Emits `data-disabled` so one selector styles a disabled control either way.
 */
export function Button({
  disabled = false,
  type = 'button',
  className,
  children,
  render,
  ...rest
}: ButtonProps) {
  // `type` and `disabled` only mean anything on a `<button>`, and `render` is the one
  // thing that can move us off one. An element literal says which it is; a component
  // cannot be inspected, so it is left to pass its own `type` if it needs one.
  const rendersButton = render === undefined || render.type === 'button';

  const elementProps: UnknownProps = rendersButton
    ? { type, disabled: disabled || undefined }
    : { 'aria-disabled': disabled || undefined };

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...elementProps,
      'data-disabled': disabled ? '' : undefined,
      className,
      children,
    },
    consumerProps: rest as UnknownProps,
  });
}
