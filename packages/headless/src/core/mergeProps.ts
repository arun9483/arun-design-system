/**
 * Prop merging for headless components.
 *
 * A component and its consumer both want to put things on the same element. Naive
 * spreading lets whichever runs last silently destroy the other's behaviour, so each
 * kind of prop is combined rather than replaced.
 */
export type UnknownProps = Record<string, unknown>;

type Ref = ((node: unknown) => unknown) | { current: unknown } | null | undefined;

function isEventHandler(key: string): boolean {
  return key.length > 2 && key.startsWith('on') && key[2] === key[2]?.toUpperCase();
}

function mergeRefs(...refs: Ref[]) {
  return (node: unknown) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        const result = ref(node);
        // React 19 lets a ref callback return its own cleanup. A legacy callback
        // returns nothing and expects to be called with null on detach instead —
        // and it would never get that call, because returning a cleanup from the
        // merged callback opts the whole ref out of React's null-on-detach path.
        return typeof result === 'function' ? result : () => ref(null);
      }
      if (ref && typeof ref === 'object') {
        ref.current = node;
        return () => {
          ref.current = null;
        };
      }
      return undefined;
    });
    // React 19 supports cleanup functions returned from ref callbacks.
    return () => {
      cleanups.forEach((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  };
}

/**
 * An event a consumer's handler can use to stop the component's own handler running.
 *
 * `preventDefault()` is deliberately not overloaded for this: it already means "cancel
 * the browser's default action", which is a different statement. A link inside a
 * component may well want one without the other.
 */
export type ComponentEvent<E = unknown> = E & {
  /** Stops the component's own handler for this event. */
  preventComponentHandler(): void;
  readonly componentHandlerPrevented?: boolean;
};

/**
 * Guarded rather than assumed: not every `on*` prop receives an event. `onCheckedChange`
 * is called with a boolean, and those chains always run in full — there is nothing to
 * attach the signal to.
 */
function isSyntheticEvent(event: unknown): boolean {
  return typeof event === 'object' && event !== null && 'nativeEvent' in event;
}

function makeEventPreventable(event: object): void {
  const target = event as ComponentEvent<object>;
  target.preventComponentHandler = () => {
    (target as { componentHandlerPrevented: boolean }).componentHandlerPrevented = true;
  };
}

function isComponentHandlerPrevented(event: unknown): boolean {
  return (
    typeof event === 'object' &&
    event !== null &&
    (event as { componentHandlerPrevented?: boolean }).componentHandlerPrevented === true
  );
}

type Handler = (...args: unknown[]) => void;

/**
 * Chains two handlers into one.
 *
 * `value` comes from a later prop object than `earlier`, and runs **first** — later
 * objects hold higher-precedence props, and the higher-precedence handler gets the
 * chance to stop the ones beneath it.
 *
 * Chaining is repeated as the merge folds, so `earlier` is usually itself a chain:
 * three handlers give `chain(chain(a, b), c)`, which runs c, b, a. Because the signal
 * lives on the event rather than in a closure, stopping at any level skips every level
 * below it, not merely the next handler.
 */
function chainHandlers(earlier: Handler, value: Handler): Handler {
  return (...args) => {
    const event = args[0];
    if (isSyntheticEvent(event)) makeEventPreventable(event as object);

    value(...args);
    if (isComponentHandlerPrevented(event)) return;
    earlier(...args);
  };
}

/**
 * Merge prop objects left to right. Later objects win for plain values, but:
 * - event handlers are chained rather than replaced
 * - className is concatenated
 * - style is shallow-merged
 * - refs are merged
 *
 * `undefined` values are skipped, so an absent key on a later object never
 * clobbers a value set by an earlier one.
 *
 * **Event handlers run right to left** — the last object's handler first, the first
 * object's last. Since a component passes its own props first and the consumer's last,
 * the consumer's handler runs before the component's and can stop it:
 *
 *     <Switch.Root onClick={(event) => event.preventComponentHandler()} />
 *
 * That is the opposite direction to plain values, where later objects win. The escape
 * hatch belongs to the consumer: a component already decides which props reach the
 * element, so it never needs the chain to suppress anything — it declines to attach the
 * handler instead. See docs/architecture.md decision 8.
 */
export function mergeProps(...objects: (UnknownProps | undefined)[]): UnknownProps {
  const merged: UnknownProps = {};

  for (const props of objects) {
    if (!props) continue;

    for (const key of Object.keys(props)) {
      const value = props[key];
      if (value === undefined) continue;

      if (isEventHandler(key) && typeof value === 'function') {
        const earlier = merged[key];
        merged[key] =
          typeof earlier === 'function'
            ? chainHandlers(earlier as Handler, value as Handler)
            : value;
      } else if (key === 'className') {
        merged.className = merged.className
          ? `${String(merged.className)} ${String(value)}`
          : value;
      } else if (key === 'style') {
        merged.style = { ...(merged.style as object), ...(value as object) };
      } else if (key === 'ref') {
        merged.ref = merged.ref ? mergeRefs(merged.ref as Ref, value as Ref) : value;
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}
