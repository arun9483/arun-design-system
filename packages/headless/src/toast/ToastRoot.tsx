'use client';

import { useEffect, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { ToastRootContext, useToastContext } from './ToastContext';
import type { ToastObject } from './ToastContext';

type ToastRootOwnProps = {
  /** The toast this renders — one of `useToastManager().toasts`. */
  toast: ToastObject;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToastRootProps = ToastRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToastRootOwnProps>;

/**
 * One toast. Closes itself after its `timeout`, counting only while not paused, and on Esc while
 * focus is in it. A `priority: 'high'` toast is `role="alert"`; the rest are announced politely
 * by the Viewport. `data-type` carries its `type`, for styling.
 */
export function ToastRoot({ toast, className, children, render, ...rest }: ToastRootProps) {
  const { close, paused, viewportRef } = useToastContext('<Toast.Root>');
  const elementRef = useRef<HTMLElement | null>(null);
  const { id, timeout } = toast;

  // The time left, carried across pauses; a new timeout starts it again.
  const remaining = useRef(timeout);
  const lastTimeout = useRef(timeout);

  useEffect(() => {
    // After the previous timer's cleanup has taken its time off, so a new timeout starts full.
    if (lastTimeout.current !== timeout) {
      lastTimeout.current = timeout;
      remaining.current = timeout;
    }
    if (paused || timeout <= 0) return;
    const started = Date.now();
    const timer = setTimeout(() => close(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [paused, timeout, id, close]);

  // Closing with focus inside would drop it to the body: hand it to the Viewport. Tracked from
  // focus events, since by the time an effect cleans up the element is gone and so is focus.
  const focusInside = useRef(false);
  useEffect(
    () => () => {
      if (focusInside.current) viewportRef.current?.focus();
    },
    [viewportRef],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: toast.priority === 'high' ? 'alert' : undefined,
      'aria-atomic': true,
      'data-type': toast.type,
      className,
      children,
      ref: elementRef,
      onFocus() {
        focusInside.current = true;
      },
      onBlur(event: ReactFocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) focusInside.current = false;
      },
      onKeyDown(event: ReactKeyboardEvent) {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(id);
        }
      },
    },
    consumerProps: rest as UnknownProps,
  });

  return <ToastRootContext.Provider value={toast}>{element}</ToastRootContext.Provider>;
}
