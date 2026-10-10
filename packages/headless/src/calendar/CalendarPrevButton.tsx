'use client';

import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useCalendarRootContext } from './CalendarRootContext';

type CalendarNavButtonOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type CalendarNavButtonProps = CalendarNavButtonOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof CalendarNavButtonOwnProps>;

/** Shows the month before. Disabled when `min` is in the first month shown. Put an icon in it. */
export function CalendarPrevButton({
  className,
  children,
  render,
  ...rest
}: CalendarNavButtonProps) {
  const { canGoPrevious, goPrevious, labels } = useCalendarRootContext('PrevButton');
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      'aria-label': labels.previous,
      disabled: !canGoPrevious || undefined,
      className,
      children,
      onClick() {
        if (canGoPrevious) goPrevious();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
