import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';
import { useComboboxChipContext } from './ComboboxChip';

type ComboboxChipRemoveOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxChipRemoveProps = ComboboxChipRemoveOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ComboboxChipRemoveOwnProps>;

/**
 * Removes its Chip's item from the selection. Give it an `aria-label` — "Remove Book".
 * Disabled with its Chip.
 * Out of the tab order; a press returns focus to the input.
 */
export function ComboboxChipRemove({
  className,
  children,
  render,
  ...rest
}: ComboboxChipRemoveProps) {
  const { remove, inputRef } = useComboboxRootContext('ChipRemove');
  const { value, disabled } = useComboboxChipContext();

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      tabIndex: -1,
      disabled: disabled || undefined,
      className,
      children,
      onMouseDown(event: ReactMouseEvent) {
        event.preventDefault();
      },
      onClick() {
        if (disabled) return;
        remove(value, 'chip-remove');
        inputRef.current?.focus();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
