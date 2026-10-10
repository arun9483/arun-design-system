'use client';

import type { ChangeEvent, ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useRangeSliderRootContext, type RangeSliderThumb } from './RangeSliderRootContext';

type RangeSliderInputOwnProps = {
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the input. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLInputElement>;
};

export type RangeSliderInputProps = RangeSliderInputOwnProps &
  Omit<
    ComponentPropsWithRef<'input'>,
    | keyof RangeSliderInputOwnProps
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'min'
    | 'max'
    | 'step'
    | 'disabled'
  >;

const LABELS: Record<RangeSliderThumb, string> = { start: 'Minimum', end: 'Maximum' };

function useThumb(
  thumb: RangeSliderThumb,
  part: string,
  { render, ...rest }: RangeSliderInputProps,
) {
  const { value, min, max, step, disabled, raised, refs, onChange } =
    useRangeSliderRootContext(part);
  return useRender({
    render,
    defaultTagName: 'input',
    props: {
      type: 'range',
      min,
      max,
      step,
      value: value[thumb === 'start' ? 0 : 1],
      disabled: disabled || undefined,
      'aria-label': LABELS[thumb],
      'data-raised': raised === thumb ? '' : undefined,
      ref: refs[thumb],
      onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(thumb, event),
    },
    consumerProps: rest as UnknownProps,
  });
}

/**
 * The range's start: a native `<input type="range">`, so its keys, steps and form value are the
 * platform's. `name` submits it with a form. Named "Minimum" unless labelled otherwise.
 */
export function RangeSliderStartInput(props: RangeSliderInputProps) {
  return useThumb('start', 'StartInput', props);
}

/** The range's end, as StartInput is the start. Named "Maximum" unless labelled otherwise. */
export function RangeSliderEndInput(props: RangeSliderInputProps) {
  return useThumb('end', 'EndInput', props);
}
