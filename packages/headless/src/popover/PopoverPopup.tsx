import { useEffect, useReducer, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, Ref, SyntheticEvent } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { usePopoverRootContext } from './PopoverRootContext';
import { popoverDataAttributes } from './popoverDataAttributes';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

type PopoverPopupOwnProps = {
  /** Which side of the trigger to open on. Flips to the opposite side when there is no room. */
  side?: PopoverSide;
  /** Where along that side: flush with the trigger's start or end edge, or centred on it. */
  align?: PopoverAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type PopoverPopupProps = PopoverPopupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof PopoverPopupOwnProps | 'popover'>;

/**
 * `side` and `align` as a `position-area`. A single side keyword spans the whole cross axis,
 * which centres the popup on the trigger; `span-*` starts it at one of the trigger's edges.
 */
const POSITION_AREA: Record<PopoverSide, Record<PopoverAlign, string>> = {
  bottom: { start: 'bottom span-right', center: 'bottom', end: 'bottom span-left' },
  top: { start: 'top span-right', center: 'top', end: 'top span-left' },
  right: { start: 'right span-bottom', center: 'right', end: 'right span-top' },
  left: { start: 'left span-bottom', center: 'left', end: 'left span-top' },
};

type ShowPopoverWithSource = HTMLElement & {
  showPopover(options?: { source?: HTMLElement }): void;
};

/** Flip across the axis it opens on; the other axis is left alone. */
function tryFallbacks(side: PopoverSide): string {
  return side === 'top' || side === 'bottom' ? 'flip-block' : 'flip-inline';
}

/**
 * The popup: a native `popover="auto"`, shown with `showPopover({ source })` whenever the
 * Root is open and hidden when it is not. State drives the element, never the reverse.
 *
 * Placement is CSS anchor positioning, set inline: `position-anchor` names the trigger,
 * `position-area` comes from `side` and `align`, and `position-try-fallbacks` flips it
 * when there is no room (decision 12). `data-side` and `data-align` repeat the request —
 * not where a fallback moved it, which script cannot observe.
 *
 * Light dismiss and Esc close the element before anyone is asked; the `toggle` event
 * reports it through the Root, and the element reopens if the state stays open.
 *
 * `role="dialog"`, non-modal. Name it with `aria-label` or `aria-labelledby`.
 */
export function PopoverPopup({
  side = 'bottom',
  align = 'center',
  className,
  children,
  render,
  ...rest
}: PopoverPopupProps) {
  const { open, setOpen, popupId, anchorName, triggerRef } = usePopoverRootContext('Popup');
  const elementRef = useRef<HTMLElement | null>(null);
  // Re-runs the sync after the element closed itself, in case the state did not follow.
  const [, resync] = useReducer((n: number) => n + 1, 0);

  // Runs after every render: cheap, and it keeps element and state in step whichever of
  // them moved.
  useEffect(() => {
    const popup = elementRef.current;
    // jsdom, or a `render` element without the API: nothing to drive.
    if (!popup || typeof popup.showPopover !== 'function') return;

    const shown = popup.matches(':popover-open');
    // Older engines ignore the options object and show it without the invoker link.
    if (open && !shown) {
      // TypeScript's DOM types predate the `source` option.
      (popup as ShowPopoverWithSource).showPopover({ source: triggerRef.current ?? undefined });
    } else if (!open && shown) popup.hidePopover();
  });

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      id: popupId,
      popover: 'auto',
      role: 'dialog',
      'data-side': side,
      'data-align': align,
      ...popoverDataAttributes({ open }),
      style: {
        positionAnchor: anchorName,
        positionArea: POSITION_AREA[side][align],
        positionTryFallbacks: tryFallbacks(side),
      },
      className,
      children,
      ref: elementRef,
      onToggle(event: SyntheticEvent) {
        // React carries a nested popover's toggle up the component tree; it isn't ours.
        if (event.target !== event.currentTarget) return;
        if ((event.nativeEvent as ToggleEvent).newState !== 'closed') return;
        // Light dismiss or Esc closed it. Report it; if the state stays open, reopen.
        setOpen(false);
        resync();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
