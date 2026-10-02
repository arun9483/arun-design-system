import { useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useRovingItem } from '../core/rovingGroup';
import { useToolbarContext } from './ToolbarRoot';

type ToolbarButtonOwnProps = {
  /** Out of the arrow keys, and not usable. */
  disabled?: boolean;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarButtonProps = ToolbarButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ToolbarButtonOwnProps>;

/**
 * A button in the Toolbar, one of its arrow-key items.
 */
export function ToolbarButton({
  disabled = false,
  className,
  render,
  ...rest
}: ToolbarButtonProps) {
  useToolbarContext('Button');
  const elementRef = useRef<HTMLElement | null>(null);
  const roving = useRovingItem(elementRef, disabled);
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
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
