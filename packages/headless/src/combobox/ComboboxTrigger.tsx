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
import { comboboxDataAttributes } from './comboboxDataAttributes';

type ComboboxTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxTriggerProps = ComboboxTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof ComboboxTriggerOwnProps>;

/**
 * The button that opens and closes the list — usually a chevron. Give it an `aria-label`.
 *
 * Out of the tab order and never focused: a press keeps focus in the input, which the
 * keyboard already opens the list from.
 */
export function ComboboxTrigger({ className, children, render, ...rest }: ComboboxTriggerProps) {
  const { open, multiple, disabled, setOpen, close, listId, inputRef, registerInside } =
    useComboboxRootContext('Trigger');
  const elementRef = useRef<HTMLElement | null>(null);
  // A press here toggles; it is not a press outside.
  useLayoutEffect(() => registerInside(elementRef), [registerInside]);

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      tabIndex: -1,
      'aria-expanded': open,
      'aria-controls': listId,
      disabled: disabled || undefined,
      ...comboboxDataAttributes({ open, multiple, disabled }),
      className,
      children,
      ref: elementRef,
      onMouseDown(event: ReactMouseEvent) {
        event.preventDefault();
      },
      onClick() {
        if (open) close('trigger-press');
        else setOpen(true, 'trigger-press');
        inputRef.current?.focus();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
