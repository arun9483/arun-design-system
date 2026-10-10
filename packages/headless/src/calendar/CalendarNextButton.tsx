'use client';

import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useCalendarRootContext } from './CalendarRootContext';
import type { CalendarNavButtonProps } from './CalendarPrevButton';

/** Shows the month after. Disabled when `max` is in the last month shown. Put an icon in it. */
export function CalendarNextButton({
  className,
  children,
  render,
  ...rest
}: CalendarNavButtonProps) {
  const { canGoNext, goNext, labels } = useCalendarRootContext('NextButton');
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-label': labels.next,
      disabled: !canGoNext || undefined,
      className,
      children,
      onClick() {
        if (canGoNext) goNext();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
