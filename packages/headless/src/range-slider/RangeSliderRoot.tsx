import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { useControlled } from '../core/useControlled';
import { afterReset, useLatest } from '../core/useLatest';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  RangeSliderRootContext,
  rangeSliderDataAttributes,
  type RangeSliderRootContextValue,
  type RangeSliderThumb,
  type RangeSliderValue,
} from './RangeSliderRootContext';

type RangeSliderRootOwnProps = {
  /** Controlled: the range, start then end. Provide `onValueChange` alongside it. */
  value?: RangeSliderValue;
  /** Initial range when uncontrolled; `[min, max]` if omitted. `form.reset()` returns to it. */
  defaultValue?: RangeSliderValue;
  /** Called with the whole range whenever either end moves. */
  onValueChange?: (value: RangeSliderValue) => void;
  /** The lowest value either thumb can take. Defaults to `0`. */
  min?: number;
  /** The highest value either thumb can take. Defaults to `100`. */
  max?: number;
  /** The step both thumbs move by. Defaults to `1`. */
  step?: number;
  disabled?: boolean;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type RangeSliderRootProps = RangeSliderRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof RangeSliderRootOwnProps | 'defaultChecked'>;

/** `n` on the step grid from `min`, inside the bounds. */
function snap(n: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((n - min) / step) * step;
  // Rounded to the step's own decimals: 0.1 + 0.2 must not report 0.30000000000000004.
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(decimals))));
}

/**
 * A range picked along one track: two native `<input type="range">`s, the start and the end,
 * over the same track (decision 30). The platform supplies each thumb's keys, steps, slider
 * semantics and value; the Root keeps the start at or below the end, places the stretch
 * between them through `--range-slider-start` and `--range-slider-end` (fractions of the track,
 * 0 to 1), and moves the nearer
 * thumb to a press on the track.
 *
 * The inputs are stacked, so styling must let only their thumbs take a press — `pointer-events:
 * none` on each input and `auto` on its thumb — or the top input takes every press.
 *
 * Name the group with `aria-label` or `aria-labelledby`, as with any `role="group"`.
 */
export function RangeSliderRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  children,
  render,
  ...rest
}: RangeSliderRootProps) {
  const [value, setValue] = useControlled<RangeSliderValue>({
    controlled: valueProp,
    default: defaultValue ?? [min, max],
    name: 'RangeSlider.Root',
    state: 'value',
  });

  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);
  const refs = useMemo(() => ({ start: startRef, end: endRef }), []);

  // The one path every change takes — a thumb, a press on the track, a form reset.
  const commit = useCallback(
    (next: RangeSliderValue) => {
      if (next[0] === value[0] && next[1] === value[1]) return;
      setValue(next);
      onValueChange?.(next);
    },
    [value, setValue, onValueChange],
  );

  // A thumb cannot pass the other: it stops where the other stands. The input is controlled,
  // so React puts it back if the platform moved it further.
  const onChange = useCallback(
    (thumb: RangeSliderThumb, event: ChangeEvent<HTMLInputElement>) => {
      const n = Number(event.currentTarget.value);
      commit(
        thumb === 'start' ? [Math.min(n, value[1]), value[1]] : [value[0], Math.max(n, value[0])],
      );
    },
    [commit, value],
  );

  // A press on the track, between the thumbs or beside them, moves the nearer one there. A
  // press on a thumb is the input's own, and the platform drags it.
  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (disabled || event.button !== 0) return;
    if (event.target === startRef.current || event.target === endRef.current) return;
    const root = event.currentTarget;
    const rect = root.getBoundingClientRect();
    if (rect.width === 0) return;
    let fraction = (event.clientX - rect.left) / rect.width;
    if (getComputedStyle(root).direction === 'rtl') fraction = 1 - fraction;
    const at = snap(min + fraction * (max - min), min, max, step);
    const [start, end] = value;
    // Nearer by distance; between equal thumbs, the side of the press decides.
    const thumb: RangeSliderThumb =
      Math.abs(at - start) < Math.abs(at - end) || (start === end && at < start) ? 'start' : 'end';
    event.preventDefault();
    commit(thumb === 'start' ? [Math.min(at, end), end] : [start, Math.max(at, start)]);
    refs[thumb].current?.focus();
  }

  // `form.reset()` restores each input's default, which React keeps equal to its current value,
  // so the reset would change nothing. Return to the mount-time range instead, as OtpInput does.
  const [initialValue] = useState(value);
  const latest = useLatest(commit);
  useEffect(() => {
    const form = startRef.current?.form;
    if (!form) return;
    function onReset(event: Event) {
      afterReset(event, () => latest.current(initialValue));
    }
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [latest, initialValue]);

  // Of two thumbs that meet, the one that can still move goes on top: past the middle the
  // start can only move back, so it is raised; before it, the end.
  const raised: RangeSliderThumb = value[0] >= (min + max) / 2 ? 'start' : 'end';

  const context: RangeSliderRootContextValue = useMemo(
    () => ({ value, disabled, min, max, step, raised, refs, onChange }),
    [value, disabled, min, max, step, raised, refs, onChange],
  );

  const span = max - min || 1;
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'group',
      ...rangeSliderDataAttributes({ disabled }),
      style: {
        '--range-slider-start': String((value[0] - min) / span),
        '--range-slider-end': String((value[1] - min) / span),
      } as CSSProperties,
      className,
      children,
      onPointerDown,
    },
    consumerProps: rest as UnknownProps,
  });

  return (
    <RangeSliderRootContext.Provider value={context}>{element}</RangeSliderRootContext.Provider>
  );
}
