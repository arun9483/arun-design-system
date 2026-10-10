import { RangeSlider as Headless } from '@arun-dev/headless/range-slider';
import type { RangeSliderRootProps } from '@arun-dev/headless/range-slider';
import { cn } from '../../lib/cn';

/** The track and the fill between the thumbs. All behaviour comes from @arun-dev/headless. */
export function RangeSliderRoot({ className, ...props }: RangeSliderRootProps) {
  return <Headless.Root {...props} className={cn('range-slider', className)} />;
}
