import { createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';

type ComboboxChipOwnProps<T> = {
  /** The selected item this chip shows — one of the Root's `value`. */
  value: T;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxChipProps<T = unknown> = ComboboxChipOwnProps<T> &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxChipOwnProps<T>>;

/** The item a Chip stands for, for its ChipRemove. */
export const ComboboxChipContext = createContext<{ value: unknown; disabled: boolean } | null>(
  null,
);

export function useComboboxChipContext(): { value: unknown; disabled: boolean } {
  const context = useContext(ComboboxChipContext);
  if (context === null) {
    throw new Error('<Combobox.ChipRemove> must be rendered inside <Combobox.Chip>.');
  }
  return context;
}

/**
 * One selected item, with `multiple`. Render one per item of the Root's `value`, before the
 * Input. Give it an `aria-description` that says how to remove it.
 *
 * `data-disabled` when the Root is disabled, or when its item's Item is: then it cannot be
 * removed.
 *
 * Out of the tab order. Left from the start of the input reaches the last chip; Left and
 * Right move between chips, and Right from the last returns to the input; Backspace or
 * Delete removes the focused chip and moves to the next, or back to the input.
 */
export function ComboboxChip<T = unknown>({
  value,
  className,
  children,
  render,
  ...rest
}: ComboboxChipProps<T>) {
  const {
    disabled: rootDisabled,
    itemToKey,
    disabledKeys,
    remove,
    registerChip,
    chips,
    inputRef,
  } = useComboboxRootContext('Chip');
  const key = itemToKey(value);
  // A disabled item cannot be removed; its chip stays reachable with the arrow keys.
  const disabled = rootDisabled || disabledKeys.has(key);
  const elementRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => registerChip({ key, ref: elementRef }), [registerChip, key]);

  const chipContext = useMemo(() => ({ value: value as unknown, disabled }), [value, disabled]);

  function focusAt(index: number) {
    const chip = chips[index];
    if (chip) chip.ref.current?.focus();
    else inputRef.current?.focus();
  }

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      tabIndex: -1,
      'data-disabled': disabled ? '' : undefined,
      className,
      children,
      ref: elementRef,
      onKeyDown(event: ReactKeyboardEvent) {
        const index = chips.findIndex((chip) => chip.ref.current === elementRef.current);
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (index > 0) focusAt(index - 1);
            return;
          case 'ArrowRight':
            event.preventDefault();
            focusAt(index + 1);
            return;
          case 'Backspace':
          case 'Delete':
            event.preventDefault();
            if (disabled) return;
            remove(value, 'chip-remove');
            // The chip after it moves into its place; the last one hands focus to the input.
            focusAt(index + 1 < chips.length ? index + 1 : chips.length);
            return;
          case 'Escape':
            inputRef.current?.focus();
            return;
        }
      },
    },
    consumerProps: rest as UnknownProps,
  });

  return <ComboboxChipContext.Provider value={chipContext}>{element}</ComboboxChipContext.Provider>;
}
