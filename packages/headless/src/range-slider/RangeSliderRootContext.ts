'use client';

import { createContext, useContext } from 'react';
import type { ChangeEvent, RefObject } from 'react';

/** A range as the two thumbs hold it: the start, then the end, with start ≤ end. */
export type RangeSliderValue = readonly [number, number];

/** Which of the two thumbs: the range's start or its end. */
export type RangeSliderThumb = 'start' | 'end';

/** The state RangeSlider.Root shares with its inputs, and projects as `data-*` attributes. */
export type RangeSliderState = {
  value: RangeSliderValue;
  disabled: boolean;
};

export type RangeSliderRootContextValue = RangeSliderState & {
  min: number;
  max: number;
  step: number;
  /** The thumb drawn on top, so the one that can still move is the one a press takes. */
  raised: RangeSliderThumb;
  refs: Record<RangeSliderThumb, RefObject<HTMLInputElement | null>>;
  onChange: (thumb: RangeSliderThumb, event: ChangeEvent<HTMLInputElement>) => void;
};

export const RangeSliderRootContext = createContext<RangeSliderRootContextValue | null>(null);

export function useRangeSliderRootContext(part: string): RangeSliderRootContextValue {
  const context = useContext(RangeSliderRootContext);

  if (context === null) {
    throw new Error(`<RangeSlider.${part}> must be rendered inside <RangeSlider.Root>.`);
  }

  return context;
}

export function rangeSliderDataAttributes({ disabled }: { disabled: boolean }) {
  return { 'data-disabled': disabled ? '' : undefined };
}
