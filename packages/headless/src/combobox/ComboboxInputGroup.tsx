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

type ComboboxInputGroupOwnProps = {
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxInputGroupProps = ComboboxInputGroupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxInputGroupOwnProps>;

/**
 * The field around the Input — chips, Clear and Trigger with it — when they are drawn as one
 * box. It takes over as the popup's anchor, so the list lines up with the whole field rather
 * than the text alone, and a press on it is not a press outside.
 *
 * A press on the box itself, between its children, focuses the input.
 */
export function ComboboxInputGroup({
  className,
  children,
  render,
  ...rest
}: ComboboxInputGroupProps) {
  const { open, multiple, disabled, anchorName, registerGroup, registerInside, inputRef } =
    useComboboxRootContext('InputGroup');
  const elementRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => registerGroup(), [registerGroup]);
  useLayoutEffect(() => registerInside(elementRef), [registerInside]);

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...comboboxDataAttributes({ open, multiple, disabled }),
      style: { anchorName },
      className,
      children,
      ref: elementRef,
      onMouseDown(event: ReactMouseEvent) {
        if (event.target !== event.currentTarget || disabled) return;
        event.preventDefault();
        inputRef.current?.focus();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
