import { useCallback } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import type { UnknownProps } from '../core/mergeProps';
import { useRender } from '../core/useRender';
import { useOtpInputRootContext } from './OtpInputRootContext';

type OtpInputSlotOwnProps = {
  /** Which character of the code this slot shows, from 0. */
  index: number;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type OtpInputSlotProps = OtpInputSlotOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof OtpInputSlotOwnProps>;

/**
 * One character of the code, drawn. Shows the character at `index` unless given children,
 * and is hidden from assistive technology: the Input carries the code.
 *
 * `data-active` marks the slot the caret is on while the input has focus — every slot of a
 * selection — and `data-filled` a slot holding a character. A separator between groups of
 * slots is the consumer's own element.
 */
export function OtpInputSlot({ index, className, children, render, ...rest }: OtpInputSlotProps) {
  const { value, length, disabled, selection, registerSlot } = useOtpInputRootContext('Slot');
  const char = value.charAt(index);

  let active = false;
  if (selection) {
    active =
      selection.start === selection.end
        ? index === Math.min(selection.start, length - 1)
        : index >= selection.start && index < selection.end;
  }

  const ref = useCallback(
    (element: HTMLElement | null) => registerSlot(index, element),
    [registerSlot, index],
  );

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ref,
      'aria-hidden': true,
      'data-active': active ? '' : undefined,
      'data-filled': char ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      className,
      children: children ?? char,
    },
    consumerProps: rest as UnknownProps,
  });
}
