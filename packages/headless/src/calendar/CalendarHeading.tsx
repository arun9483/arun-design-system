'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { addMonths, formatDate, formatDateRange } from './dates';
import { useCalendarRootContext } from './CalendarRootContext';

type CalendarHeadingOwnProps = {
  /** Element to render instead of the default `<div>`, such as an `<h2>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CalendarHeadingProps = CalendarHeadingOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof CalendarHeadingOwnProps>;

/**
 * The month shown, such as "October 2026", or the months, "October – November 2026". A polite
 * live region, so a screen reader announces the new month when it changes.
 */
export function CalendarHeading({ className, render, ...rest }: CalendarHeadingProps) {
  const { visibleStart, months, locale } = useCalendarRootContext('Heading');
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const text =
    months === 1
      ? formatDate(visibleStart, locale, options)
      : formatDateRange(visibleStart, addMonths(visibleStart, months - 1), locale, options);

  return useRender({
    render,
    defaultTagName: 'div',
    props: { 'aria-live': 'polite', className, children: text },
    consumerProps: rest as UnknownProps,
  });
}
