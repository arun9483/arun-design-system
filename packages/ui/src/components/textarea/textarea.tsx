import type React from 'react';
import { useRender } from '@arun-dev/headless';
import { cn } from '../../lib/cn';

type TextareaOwnProps = {
  /**
   * Grow with the content instead of scrolling, between `--textarea-min-height` and
   * `--textarea-max-height`. CSS only (`field-sizing: content`): where a browser lacks it,
   * the textarea keeps its `rows` height and scrolls.
   */
  autoResize?: boolean;
  /**
   * Element or component to render instead of the `<textarea>`. Props and ref are merged
   * onto it.
   */
  render?: React.ReactElement;
  /** Ref to the `<textarea>`, so `register()` and focus management reach the control. */
  ref?: React.Ref<HTMLTextAreaElement>;
};

export type TextareaProps = TextareaOwnProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextareaOwnProps | 'children'>;

/**
 * A native multi-line `<textarea>`. No behaviour of its own: typing, validation and form
 * participation are the platform's, so there is no headless half — decision 7.
 *
 * One element, so every prop, `className` included, lands on the `<textarea>` — decision 11.
 */
export function Textarea({ autoResize = false, className, render, ...rest }: TextareaProps) {
  return useRender({
    render,
    defaultTagName: 'textarea',
    props: { className: cn('textarea', autoResize && 'textarea-auto-resize', className) },
    consumerProps: rest,
  });
}
