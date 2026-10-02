import { useLayoutEffect, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useToastContext } from './ToastContext';
import type { ToastObject } from './ToastContext';

type ToastViewportOwnProps = {
  /** The toasts, rendered: usually `toasts.map((toast) => <Toast.Root key={toast.id} toast={toast}>…)`. */
  children?: ReactNode | ((toasts: readonly ToastObject[]) => ReactNode);
  /** Element to render instead of the default `<section>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastViewportProps = ToastViewportOwnProps &
  Omit<ComponentPropsWithRef<'section'>, keyof ToastViewportOwnProps>;

/**
 * Where toasts show: a `<section aria-label="Notifications">`, `aria-live="polite"`, and a
 * `popover="manual"` kept open in the top layer — above a modal Dialog — with no portal
 * (decisions 12 and 16). It stays open while empty, so the live region already exists when the
 * first toast arrives, and moves back to the top of the top layer as each arrives.
 *
 * Timers pause while the pointer is over it or focus is in it.
 */
export function ToastViewport({ className, children, render, ...rest }: ToastViewportProps) {
  const { toasts, viewportRef, setPointerInside, setFocusInside } =
    useToastContext('<Toast.Viewport>');
  const elementRef = useRef<HTMLElement | null>(null);
  const newest = toasts.at(-1)?.id;

  useLayoutEffect(() => {
    const element = elementRef.current;
    viewportRef.current = element;
    if (!element || typeof element.showPopover !== 'function') return;
    // Shown again, so it sits above anything that entered the top layer since — a Dialog.
    if (element.matches(':popover-open')) element.hidePopover();
    element.showPopover();
  }, [newest, viewportRef]);

  return useRender({
    render,
    defaultTagName: 'section',
    props: {
      popover: 'manual',
      'aria-label': 'Notifications',
      'aria-live': 'polite',
      tabIndex: -1,
      className,
      ref: elementRef,
      children: typeof children === 'function' ? children(toasts) : children,
      onPointerEnter() {
        setPointerInside(true);
      },
      onPointerLeave() {
        setPointerInside(false);
      },
      onFocus() {
        setFocusInside(true);
      },
      onBlur(event: ReactFocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) setFocusInside(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
