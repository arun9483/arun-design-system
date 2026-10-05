import type { CalendarDayState } from './CalendarRootContext';

/** On a day's button: one attribute per state that holds, for styling. */
export function calendarDayDataAttributes(state: CalendarDayState) {
  return {
    'data-selected': state.selected ? '' : undefined,
    'data-range-start': state.rangeStart ? '' : undefined,
    'data-range-end': state.rangeEnd ? '' : undefined,
    'data-in-range': state.inRange ? '' : undefined,
    'data-today': state.today ? '' : undefined,
    'data-disabled': state.disabled ? '' : undefined,
  };
}
