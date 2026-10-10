'use client';

import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import {
  anchoredPopupStyle,
  anchoredDataAttributes,
  type AnchorAlign,
  type AnchorSide,
} from '../core/anchoring';
import { useCalendarRootContext } from './CalendarRootContext';

type CalendarDayDetailsOwnProps = {
  /** Which side of the day to show on. Flips to the opposite side when there is no room. */
  side?: AnchorSide;
  /** Flush with the day's start or end edge, or centred on it. */
  align?: AnchorAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CalendarDayDetailsProps = CalendarDayDetailsOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof CalendarDayDetailsOwnProps | 'children'>;

/**
 * The details card (decision 28): one for the calendar, showing the `details` of the day under
 * a resting mouse, or with focus — so a key, a click or a tap opens it. A `popover="manual"`,
 * anchored to that day, so it opens above a DatePicker's popup without closing it. Read-only, a
 * `role="tooltip"` describing its day: the grid keeps the arrow keys and Tab. Esc hides it.
 * Renders nothing until a day has details.
 */
export function CalendarDayDetails({
  side = 'top',
  align = 'center',
  className,
  render,
  ...rest
}: CalendarDayDetailsProps) {
  const { details, dayInfo } = useCalendarRootContext('DayDetails');
  const content = details.date ? dayInfo(details.date).details : null;
  const open = content != null && content !== false;
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const card = elementRef.current;
    if (!card || typeof card.showPopover !== 'function') return;
    const shown = card.matches(':popover-open');
    if (open && !shown) card.showPopover();
    else if (!open && shown) card.hidePopover();
  });

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: details.id,
      popover: 'manual',
      role: 'tooltip',
      ...anchoredDataAttributes(side, align),
      'data-open': open ? '' : undefined,
      style: anchoredPopupStyle(details.anchorName, side, align),
      className,
      children: open ? content : null,
      ref: elementRef,
    },
    consumerProps: rest as UnknownProps,
  });
}
