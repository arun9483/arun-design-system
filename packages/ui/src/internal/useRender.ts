import { cloneElement, createElement, isValidElement } from 'react';
import type { ReactElement } from 'react';

/**
 * Internal render engine for @arun-dev/ui.
 *
 * Not part of the public API. This will move to @arun-dev/headless once the first
 * component with real behaviour lands; keeping it unexported means that move will
 * not affect consumers.
 *
 * Currently a plain function — it uses no hooks yet. The `use` prefix matches the
 * API it will grow into (memoised prop merging, state -> data-* attribute mapping)
 * so call sites do not have to change.
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
 * Merge prop objects left to right. Later objects win for plain values, but:
 * - event handlers are chained rather than replaced
 * - className is concatenated
 * - style is shallow-merged
 * - refs are merged
 *
 * `undefined` values are skipped, so an absent key on a later object never
 * clobbers a value set by an earlier one.
 */
export function mergeProps(...objects: (UnknownProps | undefined)[]): UnknownProps {
  const merged: UnknownProps = {};

  for (const props of objects) {
    if (!props) continue;

    for (const key of Object.keys(props)) {
      const value = props[key];
      if (value === undefined) continue;

      if (isEventHandler(key) && typeof value === 'function') {
        const existing = merged[key];
        merged[key] =
          typeof existing === 'function'
            ? (...args: unknown[]) => {
                (existing as (...a: unknown[]) => void)(...args);
                (value as (...a: unknown[]) => void)(...args);
              }
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

export interface UseRenderParams {
  /** Element to render instead of the default. Props, className and ref are merged onto it. */
  render?: ReactElement | undefined;
  /** Tag rendered when `render` is not supplied. */
  defaultTagName: string;
  /** Prop objects to merge, in precedence order (later wins). */
  props: (UnknownProps | undefined)[];
}

export function useRender({ render, defaultTagName, props }: UseRenderParams): ReactElement {
  const merged = mergeProps(...props);

  if (isValidElement(render)) {
    return cloneElement(render, mergeProps(merged, render.props as UnknownProps));
  }

  return createElement(defaultTagName, merged);
}
