import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type SliderOwnProps = {
  className?: string;
  /** Element to render instead of the default `<input>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the `<input>`, so `register()` and focus management reach it. */
  ref?: React.Ref<HTMLInputElement>;
};

export type SliderProps = SliderOwnProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof SliderOwnProps | 'type' | 'children'>;

/**
 * A value picked along a range: a native `<input type="range">` (decision 15), so the arrow
 * keys, Page Up and Down, Home and End, `step`, the form value and `form.reset()` are the
 * platform's, and `register()` binds it. Drawn by the platform in the brand's accent, through
 * `accent-color`, which fills the track up to the thumb in every engine. Name it with a
 * `<label>`, and show the value yourself if it matters — an `<output>` beside it.
 */
export function Slider({ className, render, ...rest }: SliderProps) {
  return useRender({
    render,
    defaultTagName: 'input',
    props: { type: 'range', className: cn('slider', className) },
    consumerProps: rest,
  });
}
