import { useSyncExternalStore } from 'react';
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { rovingIndex } from '../core/rovingFocus';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';
import { comboboxDataAttributes } from './comboboxDataAttributes';

type ComboboxInputOwnProps = {
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxInputProps = ComboboxInputOwnProps &
  Omit<ComponentPropsWithRef<'input'>, keyof ComboboxInputOwnProps | 'value' | 'defaultValue'>;

/**
 * The text input: `role="combobox"`, and the element focus stays on. Its text is the Root's
 * `inputValue`. It is what the popup is anchored to, unless an InputGroup wraps it.
 *
 * Typing opens the list and filters it. Up and Down open it, or move the highlight, wrapping;
 * Home and End jump to the ends while it is open; Alt+Down opens it without highlighting.
 * Enter picks the highlighted item; Esc closes. With `multiple`, Backspace in an empty input
 * removes the last selected item, and Left at the start of the text moves into the chips.
 *
 * Leaving the input closes the list and puts the text back: the selected label, or empty
 * with `multiple`.
 */
export function ComboboxInput({ className, render, ...rest }: ComboboxInputProps) {
  const {
    open,
    multiple,
    disabled,
    inputValue,
    filteredItems,
    itemToKey,
    selectedItems,
    selectedKeys,
    disabledKeys,
    highlight,
    setHighlight,
    setOpen,
    setInputValue,
    select,
    remove,
    clearSelection,
    close,
    chips,
    inputId,
    listId,
    optionId,
    anchorName,
    hasGroup,
    inputRef,
    popupRef,
  } = useComboboxRootContext('Input');

  const highlighted = useSyncExternalStore(
    highlight.subscribe,
    () => highlight.get().index,
    () => -1,
  );

  /** Indices of the items the arrow keys reach: every filtered item that is not disabled. */
  function enabledIndices(): number[] {
    const indices: number[] = [];
    filteredItems.forEach((item, index) => {
      if (!disabledKeys.has(itemToKey(item))) indices.push(index);
    });
    return indices;
  }

  /** The item to highlight when the arrow keys open the list: the selected one, if shown. */
  function openingIndex(key: 'ArrowDown' | 'ArrowUp', enabled: number[]): number {
    if (!multiple && selectedItems[0] != null) {
      const selected = enabled.find((i) => selectedKeys.has(itemToKey(filteredItems[i])));
      if (selected !== undefined) return selected;
    }
    return (key === 'ArrowDown' ? enabled[0] : enabled.at(-1)) ?? -1;
  }

  function moveHighlight(key: string) {
    const enabled = enabledIndices();
    const next = rovingIndex(key, {
      count: enabled.length,
      current: enabled.indexOf(highlighted),
      orientation: 'vertical',
      rtl: false,
    });
    if (next !== null) setHighlight(enabled[next] ?? -1, 'keyboard');
  }

  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      id: inputId,
      type: 'text',
      role: 'combobox',
      autoComplete: 'off',
      'aria-autocomplete': 'list',
      'aria-expanded': open,
      'aria-controls': listId,
      'aria-activedescendant': open && highlighted >= 0 ? optionId(highlighted) : undefined,
      disabled: disabled || undefined,
      value: inputValue,
      ...comboboxDataAttributes({ open, multiple, disabled }),
      // The anchor, unless an InputGroup around it is.
      style: hasGroup ? undefined : { anchorName },
      className,
      ref: inputRef,
      onChange(event: ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setInputValue(text, 'input');
        // Emptying the input of a single combobox clears its selection.
        if (!multiple && text === '' && selectedItems.length > 0) clearSelection('input');
        setOpen(true, 'input');
      },
      onClick() {
        if (!disabled) setOpen(true, 'input-press');
      },
      onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
        const { key } = event;

        if (key === 'ArrowDown' || key === 'ArrowUp') {
          event.preventDefault();
          if (!open) {
            setOpen(true, 'keyboard');
            if (!event.altKey) setHighlight(openingIndex(key, enabledIndices()), 'keyboard');
            return;
          }
          moveHighlight(key);
          return;
        }

        if ((key === 'Home' || key === 'End') && open) {
          event.preventDefault();
          moveHighlight(key);
          return;
        }

        if (key === 'Enter') {
          if (!open || highlighted < 0) return;
          // Not a form submission: Enter picks.
          event.preventDefault();
          const item = filteredItems[highlighted];
          if (!disabledKeys.has(itemToKey(item))) select(item);
          return;
        }

        if (key === 'Escape') {
          if (!open) return;
          // Kept from a Dialog underneath: Esc closes the list first.
          event.preventDefault();
          close('escape');
          return;
        }

        if (!multiple) return;

        if (key === 'Backspace' && inputValue === '' && selectedItems.length > 0) {
          remove(selectedItems.at(-1), 'chip-remove');
          return;
        }

        const input = event.currentTarget;
        if (
          key === 'ArrowLeft' &&
          chips.length > 0 &&
          input.selectionStart === 0 &&
          input.selectionEnd === 0
        ) {
          event.preventDefault();
          chips.at(-1)?.ref.current?.focus();
        }
      },
      onBlur(event: ReactFocusEvent) {
        const next = event.relatedTarget as Node | null;
        if (next && popupRef.current?.contains(next)) return;
        // Into the chips: close, but keep the query being typed.
        if (next && chips.some((chip) => chip.ref.current === next)) {
          setOpen(false, 'blur');
          return;
        }
        close('blur');
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
