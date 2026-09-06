import { cloneElement, createElement, isValidElement } from 'react';
import type { ReactElement } from 'react';
import { mergeProps, type UnknownProps } from './mergeProps';

/**
 * Resolves what a component part actually renders.
 *
 * Every part goes through here, which is what makes the whole library consistent:
 * one place decides how props merge and what element comes out. A part supplies its
 * default element and the props it wants; the consumer can replace the element
 * entirely via `render` without losing any of it.
 *
 * Currently uses no hooks. The `use` prefix matches the API it will grow into
 * (memoised merging, so parts stop re-rendering their children needlessly) and keeps
 * call sites stable when that lands.
 */
export interface UseRenderParams {
  /** Element to render instead of the default. Props, className and ref are merged onto it. */
  render?: ReactElement | undefined;
  /** Tag rendered when `render` is not supplied. */
  defaultTagName: string;
  /** The component's own props, including any `data-*` state attributes it emits. */
  props?: UnknownProps;
  /**
   * The consumer's props, spread from `...rest`.
   *
   * A separate slot rather than a position in a list: precedence is then a property of
   * this signature rather than a rule each component has to remember. A component
   * cannot put a consumer's props before its own, because there is nowhere to put them.
   */
  consumerProps?: UnknownProps;
}

export function useRender({
  render,
  defaultTagName,
  props,
  consumerProps,
}: UseRenderParams): ReactElement {
  // The three tiers, in order, decided here rather than by the caller:
  //   1. the component's  2. the consumer's  3. the render element's
  // The render element's props come last, in the cloneElement pass below.
  const merged = mergeProps(props, consumerProps);

  if (isValidElement(render)) {
    return cloneElement(render, mergeProps(merged, render.props as UnknownProps));
  }

  return createElement(defaultTagName, merged);
}
