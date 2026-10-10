'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { FieldRootContext, fieldDataAttributes } from './FieldRootContext';

type FieldRootOwnProps = {
  /** Shows the Error and marks the control `aria-invalid`. Yours to set — Field validates nothing. */
  invalid?: boolean;
  /** Disables the control and marks every part `data-disabled`. */
  disabled?: boolean;
  /** Marks the control `required`, so the browser's own validation reports it. */
  required?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type FieldRootProps = FieldRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof FieldRootOwnProps>;

/** Counts registrations, so a part rendered twice, or remounted, is still seen. */
function usePresence(): [boolean, () => () => void] {
  const [count, setCount] = useState(0);
  const register = useCallback(() => {
    setCount((n) => n + 1);
    return () => setCount((n) => n - 1);
  }, []);
  return [count > 0, register];
}

/**
 * One control with its label, description and error (decision 15). Generates their ids and
 * holds `invalid`, `disabled` and `required`; `Control` puts them on the control.
 *
 * Validity is yours: set `invalid` from react-hook-form's `fieldState`, or from what the
 * browser reported. A group of controls under one label is a native `<fieldset>`.
 */
export function FieldRoot({
  invalid = false,
  disabled = false,
  required = false,
  className,
  children,
  render,
  ...rest
}: FieldRootProps) {
  const id = useId();
  const [hasDescription, registerDescription] = usePresence();
  const [hasError, registerError] = usePresence();

  const context = useMemo(
    () => ({
      invalid,
      disabled,
      required,
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      hasDescription,
      hasError,
      registerDescription,
      registerError,
    }),
    [invalid, disabled, required, id, hasDescription, hasError, registerDescription, registerError],
  );

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { ...fieldDataAttributes({ invalid, disabled, required }), className, children },
    consumerProps: rest as UnknownProps,
  });

  return <FieldRootContext.Provider value={context}>{element}</FieldRootContext.Provider>;
}
