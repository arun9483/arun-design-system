import { useContext } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { useControlled } from '../core/useControlled';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { CalendarBindingContext, CalendarRootContext, type DateRange } from './CalendarRootContext';
import type { CalendarSharedProps } from './CalendarRoot';
import { useCalendarRoot } from './useCalendarRoot';

type CalendarRangeRootOwnProps = CalendarSharedProps & {
  /** Controlled: the selected range, ISO dates both ends included. Provide `onValueChange` alongside it. */
  value?: DateRange | null;
  /** Initial selection when uncontrolled. Read once, at mount. */
  defaultValue?: DateRange | null;
  /** Called once a range is complete: after the second pick, never the first. */
  onValueChange?: (value: DateRange) => void;
  /**
   * The most days a range may cover, both ends included: `7` allows the 1st to the 7th. Once the
   * first day is picked, days further away cannot be.
   */
  maxDays?: number;
};

export type CalendarRangeRootProps = CalendarRangeRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof CalendarRangeRootOwnProps | 'defaultValue' | 'onChange'>;

/**
 * A calendar to pick a range of days from (decision 27): the first pick starts it, the second
 * completes it, in either order. In between, the range follows the pointer or focus, and the days
 * it cannot reach — past `maxDays`, or across a day that cannot be picked — are disabled.
 */
export function CalendarRangeRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  maxDays,
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
}: CalendarRangeRootProps) {
  const binding = useContext(CalendarBindingContext);
  const bound = binding?.mode === 'range' && valueProp === undefined ? binding : null;
  const [own, setOwn] = useControlled<DateRange | null>({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: 'Calendar.RangeRoot',
    state: 'value',
  });

  const context = useCalendarRoot({
    selection: {
      mode: 'range',
      value: bound ? bound.value : own,
      onSelect(range) {
        if (bound) return bound.pick(range);
        setOwn(range);
        onValueChange?.(range);
      },
    },
    min: min ?? binding?.min,
    max: max ?? binding?.max,
    isDateUnavailable: isDateUnavailable ?? binding?.isDateUnavailable,
    maxDays: maxDays ?? binding?.maxDays,
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
