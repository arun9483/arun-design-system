import { Checkbox as Headless } from '@arun-dev/headless/checkbox';
import type { CheckboxIndicatorProps } from '@arun-dev/headless/checkbox';
import { cn } from '../../lib/cn';

/**
 * The default marks.
 *
 * Both are always rendered, and `checkbox.css` reveals whichever the Root's
 * `data-checked` / `data-indeterminate` calls for. Choosing in CSS rather than in JS is
 * what keeps `@arun-dev/headless` from having to export its context: the state is
 * already in the DOM, which is the seam the two packages meet at.
 *
 * `currentColor` so a consumer can recolour the mark with `color`, and no `stroke-width`
 * attribute so the token can set it — an attribute would beat the stylesheet.
 */
function DefaultMarks() {
  return (
    <>
      <svg className="checkbox-mark checkbox-mark-check" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="checkbox-mark checkbox-mark-dash" viewBox="0 0 16 16" aria-hidden>
        <path d="M4 8h8" fill="none" stroke="currentColor" strokeLinecap="round" />
      </svg>
    </>
  );
}

/**
 * The mark. Positioned and revealed by CSS keyed off the data-* attributes Root emits.
 *
 * Ships a check and a dash by default — the opinion `@arun-dev/headless` deliberately
 * does not have. Passing children replaces both; style them off the same `data-*`
 * attributes, which this element carries too.
 */
export function CheckboxIndicator({ className, children, ...props }: CheckboxIndicatorProps) {
  return (
    <Headless.Indicator {...props} className={cn('checkbox-indicator', className)}>
      {children ?? <DefaultMarks />}
    </Headless.Indicator>
  );
}
