import { cloneElement } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { useRender } from '../core/useRender';
import { retractActivationProps, useButton } from '../useButton';

export interface ButtonProps {
  /**
   * Prevents activation. On a native `<button>` the platform handles it; on any other
   * element the state is synthesised — `aria-disabled`, removal from the tab order,
   * no activation, and a navigation target dropped.
   */
  disabled?: boolean;
  /**
   * Whether the rendered element is a native `<button>`.
   *
   * Inferred from `render`, which is right for an element literal. Set it explicitly
   * when rendering a *component* — `render={<MyButton />}` cannot be inspected, and
   * gets treated as non-native. A mismatch logs a development warning.
   */
  nativeButton?: boolean;
  className?: string;
  children?: ReactNode;
  /**
   * Element to render instead of the default `<button>`. Props, className, event
   * handlers and ref are merged onto it.
   */
  render?: ReactElement;
  ref?: Ref<HTMLElement>;
}

/**
 * A button — behaviour only, no styling.
 *
 * A native `<button>` needs almost none of this; the platform supplies focus, `Enter`
 * and `Space` activation, and `disabled`. The component earns its place the moment
 * `render` points somewhere else, which is exactly when all of that stops holding.
 *
 * It has no `href`. A control that navigates should be an `<a>`, so that middle-click,
 * cmd-click, the status bar and "link" in assistive technology all work — pass one in:
 *
 *   <Button render={<a href="/docs" target="_blank" rel="noreferrer" />}>Docs</Button>
 *
 * Emits `data-disabled` so one selector styles a disabled control whatever the element.
 */
export function Button({
  disabled = false,
  nativeButton,
  className,
  children,
  render,
  ...rest
}: ButtonProps & Record<string, unknown>) {
  const native = nativeButton ?? (render === undefined || render.type === 'button');

  // A `<div>` or `<span>` has no role of its own, so a screen reader would announce
  // nothing. An anchor is left alone: it already carries a role, and one that suits
  // navigation better than `button` would.
  const isAnchor = render !== undefined && render.type === 'a';
  const role = native || isAnchor ? undefined : 'button';

  const { props: elementProps, ref: buttonRef } = useButton({ disabled, native, props: rest });

  // A `render` element's own props merge last, so an href written directly on it
  // outranks anything useButton returns. Retract it on the element instead.
  const safeRender =
    disabled && !native && render !== undefined
      ? cloneElement(render, retractActivationProps(render.props as Record<string, unknown>))
      : render;

  return useRender({
    render: safeRender,
    defaultTagName: 'button',
    props: [{ role, className, children }, elementProps, { ref: buttonRef }],
  });
}
