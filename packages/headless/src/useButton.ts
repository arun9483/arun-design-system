import { useEffect, useRef } from 'react';
import type { Ref } from 'react';
import { mergeProps, type UnknownProps } from './core/mergeProps';

/**
 * Internal. Makes any element behave as a native `<button>` does.
 *
 * A `<button>` gets four things from the platform for free: it is focusable, `Enter`
 * and `Space` activate it, `disabled` removes it from the tab order and suppresses
 * activation, and it needs an explicit `type` so it does not default to submitting.
 * Rendered as anything else — an `<a href>`, a `<div>`, whatever `render` supplies —
 * none of that holds, and a `disabled` attribute on it is inert.
 *
 * Deliberately does **not** return `role`. The element is a button; what it *means* is
 * the component's decision — `Switch.Root` is a `<button role="switch">`, and a role
 * imposed here would have to be overridden by every such component.
 *
 * Private to this package: it exists to implement these components, so it stays free to
 * change. See decision 9 in docs/architecture.md.
 */

/**
 * Activation handlers a disabled control must not fire, mirroring what a native
 * disabled button suppresses. Hover and focus handlers are deliberately kept, so a
 * tooltip explaining *why* a control is disabled still works.
 */
const ACTIVATION_HANDLERS: readonly string[] = [
  'onClick',
  'onDoubleClick',
  'onMouseDown',
  'onMouseUp',
  'onPointerDown',
  'onPointerUp',
  'onTouchStart',
  'onTouchEnd',
  'onKeyDown',
  'onKeyUp',
  'onKeyPress',
];

type Keyboardish = {
  key: string;
  currentTarget: unknown;
  target: unknown;
  defaultPrevented: boolean;
  preventDefault(): void;
};

/** Mirrors a native button: `Enter` activates on keydown, `Space` on keyup. */
function activationHandlers(): UnknownProps {
  return {
    onKeyDown(event: Keyboardish) {
      if (event.target !== event.currentTarget || event.defaultPrevented) return;
      // Space would scroll the page. Suppress it now and activate on keyup instead.
      if (event.key === ' ') {
        event.preventDefault();
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        click(event.currentTarget);
      }
    },
    onKeyUp(event: Keyboardish) {
      if (event.target !== event.currentTarget || event.defaultPrevented) return;
      if (event.key === ' ') click(event.currentTarget);
    },
  };
}

function click(element: unknown): void {
  if (element && typeof (element as { click?: unknown }).click === 'function') {
    (element as { click(): void }).click();
  }
}

export interface UseButtonParams {
  disabled?: boolean;
  /** Whether the rendered element is a native `<button>`, which supplies all of this itself. */
  native: boolean;
  /** Props destined for the element. Returned with the button behaviour merged in. */
  props?: UnknownProps;
}

export interface UseButtonReturn {
  props: UnknownProps;
  /**
   * Attach to the rendered element. Used only by the development check that `native`
   * matches what was actually rendered; it holds no runtime behaviour.
   */
  ref: Ref<HTMLElement>;
}

export function useButton({
  disabled = false,
  native,
  props = {},
}: UseButtonParams): UseButtonReturn {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const element = elementRef.current;
    if (!element) return;

    const isButtonTag = element.tagName === 'BUTTON';
    if (native && !isButtonTag) {
      console.error(
        `A component expected a native <button> but rendered <${element.tagName.toLowerCase()}>. ` +
          'Focus, keyboard activation and `disabled` will not behave natively.',
      );
    } else if (!native && isButtonTag) {
      console.error(
        'A component rendered a native <button> while treating it as a non-native ' +
          'element, so it carries synthesised attributes it does not need.',
      );
    }
  }, [native]);

  return { props: buttonProps({ disabled, native, props }), ref: elementRef };
}

function buttonProps({ disabled, native, props }: Required<UseButtonParams>): UnknownProps {
  // mergeProps rather than a spread: a consumer's onKeyDown must chain with the
  // activation handlers, not replace them and silently remove keyboard support.
  // Ours go first, so a consumer's run before them and can stop them.
  if (!disabled) {
    return native
      ? mergeProps({ type: 'button' }, props)
      : mergeProps({ tabIndex: 0 }, activationHandlers(), props);
  }

  // The platform handles everything; `data-disabled` is added anyway so one selector
  // styles every disabled control regardless of the element underneath.
  if (native) return mergeProps({ type: 'button' }, props, { disabled: true, 'data-disabled': '' });

  const sanitised: UnknownProps = {};
  for (const key of Object.keys(props)) {
    // `href` is removed rather than blanked: keyboard activation of an anchor is not
    // reliably cancellable, so the target itself has to go.
    if (key === 'href' || ACTIVATION_HANDLERS.includes(key)) continue;
    sanitised[key] = props[key];
  }

  return {
    ...sanitised,
    'aria-disabled': true,
    'data-disabled': '',
    // Mirrors a native disabled button, which is not focusable.
    tabIndex: -1,
  };
}

/**
 * Overrides that neutralise a consumer-supplied `render` element.
 *
 * `useButton` sanitises the props a component passes, but a `render` element's own
 * props merge at the highest precedence inside `useRender`, so a `href` written
 * directly on it survives. Those have to be retracted on the element itself:
 *
 *   cloneElement(render, retractActivationProps(render.props))
 *
 * `cloneElement` overwrites with `undefined`, which `mergeProps` cannot do — it skips
 * `undefined` so an absent prop never clobbers a present one.
 */
export function retractActivationProps(props: UnknownProps): UnknownProps {
  const overrides: UnknownProps = {};
  for (const key of Object.keys(props)) {
    if (key === 'href' || ACTIVATION_HANDLERS.includes(key)) overrides[key] = undefined;
  }
  return overrides;
}
