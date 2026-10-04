import { createContext, useContext } from 'react';
import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

/** Where a step stands: done, the one in progress, or still ahead. */
export type StepperStatus = 'complete' | 'current' | 'upcoming';

type StepperLabels = {
  /** Read after a complete step's label, by screen readers only. Defaults to `"completed"`. */
  complete?: string;
};

const StepperLabelsContext = createContext<Required<StepperLabels>>({ complete: 'completed' });

type StepperRootOwnProps = {
  /** Steps in a row, the default, or down a column. */
  orientation?: 'horizontal' | 'vertical';
  /** Text read out but not shown, for translating. */
  labels?: StepperLabels;
  className?: string;
  /** Element to render instead of the default `<ol>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type StepperRootProps = StepperRootOwnProps &
  Omit<React.OlHTMLAttributes<HTMLOListElement>, keyof StepperRootOwnProps>;

/**
 * The steps of a multi-step flow, and how far along it is (decision 25): an ordered list, so a
 * screen reader announces "2 of 4". Which step is current is yours — your state or your URL —
 * as the page is for Pagination, so there is nothing for the Stepper to hold.
 *
 * Name it with `aria-label`, such as "Checkout progress".
 */
export function StepperRoot({
  orientation = 'horizontal',
  labels,
  className,
  children,
  render,
  ...rest
}: StepperRootProps) {
  const element = useRender({
    render,
    defaultTagName: 'ol',
    props: {
      // The markers are drawn, not the list's own: role="list" keeps it announced as a list
      // in Safari, which can drop that for a list without list-style.
      role: 'list',
      className: cn('stepper', orientation === 'vertical' && 'stepper-vertical', className),
      children,
    },
    consumerProps: rest,
  });
  return (
    <StepperLabelsContext.Provider value={{ complete: labels?.complete ?? 'completed' }}>
      {element}
    </StepperLabelsContext.Provider>
  );
}

type StepperItemOwnProps = {
  /** Done, in progress, or ahead. Defaults to `upcoming`. Exactly one step is `current`. */
  status?: StepperStatus;
  className?: string;
  /** Element to render instead of the default `<li>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type StepperItemProps = StepperItemOwnProps &
  Omit<React.LiHTMLAttributes<HTMLLIElement>, keyof StepperItemOwnProps>;

/**
 * One step. Its number, or a tick once complete, is drawn beside the label and hidden from
 * screen readers, which hear the list position instead. The current step is
 * `aria-current="step"`; a complete one adds "completed", read but not shown, so the tick is
 * never the only sign.
 *
 * The label is your content: plain text, or a button or link to go back to that step.
 */
export function StepperItem({
  status = 'upcoming',
  className,
  children,
  render,
  ...rest
}: StepperItemProps) {
  const labels = useContext(StepperLabelsContext);
  return useRender({
    render,
    defaultTagName: 'li',
    props: {
      'aria-current': status === 'current' ? 'step' : undefined,
      className: cn('stepper-item', `stepper-item-${status}`, className),
      children: (
        <>
          <span className="stepper-indicator" aria-hidden="true" />
          <span className="stepper-label">
            {children}
            {status === 'complete' && <span className="sr-only"> ({labels.complete})</span>}
          </span>
        </>
      ),
    },
    consumerProps: rest,
  });
}
