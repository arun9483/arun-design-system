import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type MeterOwnProps = {
  className?: string;
  /** Element to render instead of the default `<meter>`. Props and ref are merged onto it. */
  render?: React.ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: React.Ref<HTMLMeterElement>;
};

export type MeterProps = MeterOwnProps &
  Omit<React.MeterHTMLAttributes<HTMLMeterElement>, keyof MeterOwnProps>;

/**
 * How much of a known range — a disk's usage, a password's strength: a native `<meter>`
 * (decision 15). `low`, `high` and `optimum` colour it as the platform does: good, fair or poor,
 * on the success, warning and error tokens. Progress through a task is a `Progress`.
 */
export function Meter({ className, render, ...rest }: MeterProps) {
  return useRender({
    render,
    defaultTagName: 'meter',
    props: { className: cn('meter', className) },
    consumerProps: rest,
  });
}
