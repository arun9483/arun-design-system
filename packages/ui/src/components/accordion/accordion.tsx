'use client';

import { createContext, useContext, useId, useState } from 'react';
import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

/** The `name` an exclusive Root gives each Item, so the browser keeps one open. */
const AccordionContext = createContext<string | undefined>(undefined);

type AccordionRootOwnProps = {
  /** Only one Item open at a time: every Item gets the same generated `name`. */
  exclusive?: boolean;
  className?: string;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type AccordionRootProps = AccordionRootOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof AccordionRootOwnProps>;

/** Items one under another. Optional: an Item works alone, as a single disclosure. */
export function AccordionRoot({
  exclusive = false,
  className,
  render,
  ...rest
}: AccordionRootProps) {
  const name = useId();
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: { className: cn('accordion', className) },
    consumerProps: rest,
  });
  return (
    <AccordionContext.Provider value={exclusive ? name : undefined}>
      {element}
    </AccordionContext.Provider>
  );
}

type AccordionItemOwnProps = {
  /** Open at mount. Read once; the browser owns it after that. */
  defaultOpen?: boolean;
  className?: string;
  /** Ref to the `<details>`. */
  ref?: React.Ref<HTMLDetailsElement>;
};

export type AccordionItemProps = AccordionItemOwnProps &
  Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, keyof AccordionItemOwnProps>;

/**
 * One section that opens and closes: a native `<details>` (decision 16). Control it with `open`
 * and `onToggle` — the event's `newState` is `"open"` or `"closed"`. Items sharing a `name`, or
 * under an `exclusive` Root, open one at a time.
 */
export function AccordionItem({
  defaultOpen = false,
  open,
  name,
  className,
  ...rest
}: AccordionItemProps) {
  const groupName = useContext(AccordionContext);
  // Frozen: re-rendering with the same `open` never touches the DOM, so the browser keeps
  // what the user did.
  const [initialOpen] = useState(defaultOpen);
  return (
    <details
      {...rest}
      name={name ?? groupName}
      open={open ?? initialOpen}
      className={cn('accordion-item', className)}
    />
  );
}

type AccordionTriggerOwnProps = {
  className?: string;
  /** Ref to the `<summary>`. */
  ref?: React.Ref<HTMLElement>;
};

export type AccordionTriggerProps = AccordionTriggerOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof AccordionTriggerOwnProps>;

/** The Item's always-visible line, and what opens it: a `<summary>`, with a chevron. */
export function AccordionTrigger({ className, children, ...rest }: AccordionTriggerProps) {
  return (
    <summary {...rest} className={cn('accordion-trigger', className)}>
      <span className="accordion-trigger-text">{children}</span>
      <svg className="accordion-icon" viewBox="0 0 16 16" aria-hidden>
        <path d="m4 6 4 4 4-4" />
      </svg>
    </summary>
  );
}

type AccordionPanelOwnProps = {
  className?: string;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type AccordionPanelProps = AccordionPanelOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof AccordionPanelOwnProps>;

/** What the Item reveals. */
export function AccordionPanel({ className, render, ...rest }: AccordionPanelProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: { className: cn('accordion-panel', className) },
    consumerProps: rest,
  });
}
