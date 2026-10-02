import { useLayoutEffect, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';
import { comboboxClearDataAttributes } from './comboboxDataAttributes';

type ComboboxClearOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxClearProps = ComboboxClearOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ComboboxClearOwnProps>;

/**
 * Empties the input and the selection — every selected item, with `multiple`. Give it an
 * `aria-label`.
 *
 * `data-visible` is present while there is a selection to clear; style it hidden otherwise.
 * Out of the tab order, and a press keeps focus in the input.
 */
export function ComboboxClear({ className, children, render, ...rest }: ComboboxClearProps) {
  const { disabled, selectedItems, clear, inputRef, registerInside } =
    useComboboxRootContext('Clear');
  const elementRef = useRef<HTMLElement | null>(null);
  // A press here clears; it is not a press outside, and the list stays as it is.
  useLayoutEffect(() => registerInside(elementRef), [registerInside]);

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      tabIndex: -1,
      disabled: disabled || undefined,
      ...comboboxClearDataAttributes(selectedItems.length > 0),
      className,
      children,
      ref: elementRef,
      onMouseDown(event: ReactMouseEvent) {
        event.preventDefault();
      },
      onClick() {
        if (disabled) return;
        clear();
        inputRef.current?.focus();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
