'use client';

import { useContext } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  CalendarBindingContext,
  CalendarRootContext,
  type CalendarLabels,
} from './CalendarRootContext';
import { useCalendarRoot } from './useCalendarRoot';
import type { CalendarDayInfo, CalendarDayPropsGetter, CalendarVisibleRange } from './useDayInfo';

/** What both Roots take besides their selection. */
export type CalendarSharedProps = {
  /** The earliest day that can be picked, as an ISO date. Earlier months cannot be shown. */
  min?: string;
  /** The latest day that can be picked, as an ISO date. Later months cannot be shown. */
  max?: string;
  /** Days that cannot be picked, such as weekends or booked dates. Called with an ISO date. */
  isDateUnavailable?: (date: string) => boolean;
  /** How many months to show side by side, each its own Grid. */
  months?: number;
  /** The locale for names and numbers, and for the first day of the week. Defaults to the browser's. */
  locale?: string;
  /** 0 for Sunday to 6 for Saturday. Defaults to the locale's. */
  firstDayOfWeek?: number;
  /** Labels for the Previous and Next buttons, in English unless replaced. */
  labels?: Partial<CalendarLabels>;
  /**
   * What a day is, for marks, screen readers and a details card: `tags`, a `description` and
   * `details`. Called with each day shown, so it is a lookup in data already loaded; fetch it
   * from `onVisibleRangeChange`. Optional: without it the calendar shows no tags.
   */
  getDayInfo?: (date: string) => CalendarDayInfo | null | undefined;
  /**
   * The tags that may mark a day, the first winning: a day shows one mark, for its tag highest
   * here. Defaults to booked, holiday, festival, birthday. Other tags mark nothing.
   */
  tagPriority?: readonly string[];
  /** Called with the days shown when the calendar mounts and whenever the months shown change. */
  onVisibleRangeChange?: (range: CalendarVisibleRange) => void;
  /** Day information is loading: the grids are `aria-busy`. */
  loading?: boolean;
  /** Extra attributes for each day's button, from its date and tags: per-day styling. */
  dayProps?: CalendarDayPropsGetter;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

type CalendarRootOwnProps = CalendarSharedProps & {
  /** Controlled: the selected day, as an ISO date (`YYYY-MM-DD`). Provide `onValueChange` alongside it. */
  value?: string | null;
  /** Initial selection when uncontrolled. Read once, at mount. */
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
};

export type CalendarRootProps = CalendarRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof CalendarRootOwnProps | 'defaultValue' | 'onChange'>;

/**
 * A calendar to pick one day from (decision 27). Holds the selection, the month shown and the
 * day with the Tab stop, and shares them with Heading, PrevButton, NextButton and Grid.
 *
 * Inside a DatePicker's Popup it takes the picker's value and constraints, and a pick goes to
 * the picker; its own props win over them.
 */
export function CalendarRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  months = 1,
  locale,
  firstDayOfWeek,
  labels,
  getDayInfo,
  tagPriority,
  onVisibleRangeChange,
  loading = false,
  dayProps,
  className,
  children,
  render,
  ...rest
}: CalendarRootProps) {
  const binding = useContext(CalendarBindingContext);
  const bound = binding?.mode === 'single' && valueProp === undefined ? binding : null;
  const [own, setOwn] = useControlled<string | null>({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: 'Calendar.Root',
    state: 'value',
  });

  const context = useCalendarRoot({
    selection: {
      mode: 'single',
      value: bound ? bound.value : own,
      onSelect(iso) {
        if (bound) return bound.pick(iso);
        if (iso === own) return;
        setOwn(iso);
        onValueChange?.(iso);
      },
    },
    min: min ?? binding?.min,
    max: max ?? binding?.max,
    isDateUnavailable: isDateUnavailable ?? binding?.isDateUnavailable,
    maxDays: undefined,
    months,
    locale,
    firstDayOfWeek,
    labels,
    openCount: binding?.openCount,
    getDayInfo,
    tagPriority,
    onVisibleRangeChange,
    loading,
    dayProps,
  });

  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { 'data-loading': loading ? '' : undefined, className, children },
    consumerProps: rest as UnknownProps,
  });

  return <CalendarRootContext.Provider value={context}>{element}</CalendarRootContext.Provider>;
}
