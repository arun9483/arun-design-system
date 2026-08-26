import { cloneElement, createElement, isValidElement } from 'react';
import type { ReactElement } from 'react';
import { mergeProps, type UnknownProps } from './mergeProps';
import { getStateAttributes, type StateAttributeMapping } from './stateAttributes';

/**
 * Resolves what a component part actually renders.
 *
 * Every part goes through here, which is what makes the whole library consistent:
 * one place decides how props merge, how state reaches the DOM, and what element
 * comes out. A part supplies its default element, its state, and the props it wants;
 * the consumer can replace the element entirely via `render` without losing any of it.
 *
 * Currently uses no hooks. The `use` prefix matches the API it will grow into
 * (memoised merging, so parts stop re-rendering their children needlessly) and keeps
 * call sites stable when that lands.
 */
export interface UseRenderParams<State extends Record<string, unknown>> {
  /** Element to render instead of the default. Props, className and ref are merged onto it. */
  render?: ReactElement | undefined;
  /** Tag rendered when `render` is not supplied. */
  defaultTagName: string;
  /** Prop objects to merge, in precedence order (later wins). */
  props: (UnknownProps | undefined)[];
  /** The part's state, projected onto the DOM through `stateAttributes`. */
  state?: State;
  /** How each state field becomes `data-*` attributes. */
  stateAttributes?: StateAttributeMapping<State>;
}

export function useRender<State extends Record<string, unknown> = Record<string, never>>({
  render,
  defaultTagName,
  props,
  state,
  stateAttributes,
}: UseRenderParams<State>): ReactElement {
  // State attributes come first so a consumer can still override them deliberately.
  const attributes = state ? getStateAttributes(state, stateAttributes) : {};
  const merged = mergeProps(attributes, ...props);

  if (isValidElement(render)) {
    return cloneElement(render, mergeProps(merged, render.props as UnknownProps));
  }

  return createElement(defaultTagName, merged);
}
