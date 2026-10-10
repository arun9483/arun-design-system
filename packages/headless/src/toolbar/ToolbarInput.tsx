'use client';

import { useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useRovingItem } from '../core/rovingGroup';
import { useToolbarContext } from './ToolbarRoot';

type ToolbarInputOwnProps = {
  /** Out of the arrow keys, and not usable. */
  disabled?: boolean;
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarInputProps = ToolbarInputOwnProps &
  Omit<ComponentPropsWithRef<'input'>, keyof ToolbarInputOwnProps>;

/**
 * A field in the Toolbar, one of its arrow-key items. It keeps Left, Right, Home and End
 * for its caret until the caret is at an end.
 */
export function ToolbarInput({ disabled = false, className, render, ...rest }: ToolbarInputProps) {
  useToolbarContext('Input');
  const elementRef = useRef<HTMLElement | null>(null);
  const roving = useRovingItem(elementRef, disabled);
  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      disabled: disabled || undefined,
      'data-disabled': disabled ? '' : undefined,
      tabIndex: roving.tabIndex,
      className,
      ref: elementRef,
      onFocus: roving.onFocus,
    },
    consumerProps: rest as UnknownProps,
  });
}
