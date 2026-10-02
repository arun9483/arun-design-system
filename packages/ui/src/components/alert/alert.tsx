import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

/** Generic status tones, as Badge's. */
export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

type AlertRootOwnProps = {
  /** Colour, on the status tokens. Defaults to `"neutral"`. */
  tone?: AlertTone;
  /** An icon before the text. Decorative: it is hidden from assistive technology. */
  icon?: React.ReactNode;
  className?: string;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLElement>;
};

export type AlertRootProps = AlertRootOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof AlertRootOwnProps>;

/**
 * A message box (decision 16). No live role by default: one on the page from the start is
 * content. Add `role="alert"` (urgent) or `role="status"` (polite) when it appears in response to
 * something.
 */
export function AlertRoot({
  tone = 'neutral',
  icon,
  className,
  children,
  render,
  ...rest
}: AlertRootProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      className: cn('alert', tone !== 'neutral' && `alert-${tone}`, className),
      children: (
        <>
          {icon != null && (
            <span className="alert-icon" aria-hidden>
              {icon}
            </span>
          )}
          <div className="alert-body">{children}</div>
        </>
      ),
    },
    consumerProps: rest,
  });
}

type AlertPartProps = {
  className?: string;
  render?: React.ReactElement;
  ref?: React.Ref<HTMLElement>;
} & Omit<React.HTMLAttributes<HTMLElement>, 'className'>;

export type AlertTitleProps = AlertPartProps;
export type AlertDescriptionProps = AlertPartProps;

/** The headline. A `<p>`; give `render={<h2 />}` if it heads a section. */
export function AlertTitle({ className, render, ...rest }: AlertTitleProps) {
  return useRender({
    render,
    defaultTagName: 'p',
    props: { className: cn('alert-title', className) },
    consumerProps: rest,
  });
}

/** The detail, under the title. */
export function AlertDescription({ className, render, ...rest }: AlertDescriptionProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: { className: cn('alert-description', className) },
    consumerProps: rest,
  });
}
