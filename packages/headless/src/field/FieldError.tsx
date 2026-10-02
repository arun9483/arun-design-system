import { useLayoutEffect } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { fieldDataAttributes, useFieldRootContext } from './FieldRootContext';

type FieldErrorOwnProps = {
  /** Element to render instead of the default `<p>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type FieldErrorProps = FieldErrorOwnProps &
  Omit<ComponentPropsWithRef<'p'>, keyof FieldErrorOwnProps>;

/**
 * What is wrong, read out with the control through `aria-describedby`. Rendered only while the
 * Root is `invalid`, so it is named only while it is shown.
 */
export function FieldError({ className, children, render, ...rest }: FieldErrorProps) {
  const context = useFieldRootContext('Error');
  const { invalid, disabled, required } = context;
  if (!invalid) return null;
  return (
    <ShownError
      className={className}
      render={render}
      state={{ invalid, disabled, required }}
      {...rest}
    >
      {children}
    </ShownError>
  );
}

/** Mounted only while shown, so its registration follows `invalid`. */
function ShownError({
  className,
  children,
  render,
  state,
  ...rest
}: FieldErrorProps & { state: Parameters<typeof fieldDataAttributes>[0] }) {
  const { errorId, registerError } = useFieldRootContext('Error');
  useLayoutEffect(registerError, [registerError]);

  return useRender({
    render,
    defaultTagName: 'p',
    props: { id: errorId, ...fieldDataAttributes(state), className, children },
    consumerProps: rest as UnknownProps,
  });
}
