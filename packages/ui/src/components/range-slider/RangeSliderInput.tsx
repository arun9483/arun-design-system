'use client';

import { RangeSlider as Headless } from '@arun-dev/headless/range-slider';
import type { RangeSliderInputProps } from '@arun-dev/headless/range-slider';
import { cn } from '../../lib/cn';

/** The start's thumb, drawn over the track. All behaviour comes from @arun-dev/headless. */
export function RangeSliderStartInput({ className, ...props }: RangeSliderInputProps) {
  return <Headless.StartInput {...props} className={cn('range-slider-input', className)} />;
}

/** The end's thumb, drawn over the track. All behaviour comes from @arun-dev/headless. */
export function RangeSliderEndInput({ className, ...props }: RangeSliderInputProps) {
  return <Headless.EndInput {...props} className={cn('range-slider-input', className)} />;
}
