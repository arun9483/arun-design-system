import type { UnknownProps } from './core/mergeProps';

/**
 * Makes any element behave as a disabled-capable button.
 *
 * A native `<button disabled>` needs no JavaScript: the platform removes it from the
 * tab order, suppresses activation, and exposes `:disabled`. Every other element —
 * an `<a href>`, a `<div>`, whatever `render` supplies — gets none of that, and a
 * `disabled` attribute on it is inert. Without this, a "disabled" link stays
 * focusable, still fires handlers, and still navigates.
 *
 * Consumer props are returned sanitised rather than merged over, because neither can
 * be undone through `mergeProps`: `undefined` values are skipped, so a prop cannot be
 * retracted, and handlers are chained rather than replaced, so a consumer's `onClick`
 * would still run after an internal one called `preventDefault()`. See decision 8 in
 * docs/architecture.md.
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

export interface UseButtonParams {
  disabled?: boolean;
  /** Whether the rendered element is a native `<button>`, which the platform disables for us. */
  native: boolean;
  /** Props destined for the element. Returned unchanged unless `disabled`. */
  props?: UnknownProps;
}

export function useButton({ disabled = false, native, props = {} }: UseButtonParams): UnknownProps {
  if (!disabled) return props;

  // The platform handles everything; `data-disabled` is added anyway so one selector
  // styles every disabled control regardless of the element underneath.
  if (native) return { ...props, disabled: true, 'data-disabled': '' };

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
