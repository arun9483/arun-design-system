'use client';

import { useEffect, useReducer } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import {
  anchoredDataAttributes,
  anchoredPopupStyle,
  type AnchorAlign,
  type AnchorSide,
  type PopoverElement,
} from '../core/anchoring';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useComboboxRootContext } from './ComboboxRootContext';
import { comboboxDataAttributes } from './comboboxDataAttributes';

export type ComboboxSide = AnchorSide;
export type ComboboxAlign = AnchorAlign;

type ComboboxPopupOwnProps = {
  /** Which side of the input to open on. Flips to the opposite side when there is no room. */
  side?: ComboboxSide;
  /** Where along that side: flush with the input's start or end edge, or centred on it. */
  align?: ComboboxAlign;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ComboboxPopupProps = ComboboxPopupOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ComboboxPopupOwnProps | 'popover'>;

/**
 * The box the list opens in: a native `popover="manual"` in the top layer, anchored to the
 * Input as Popover's popup is to its Trigger (decision 12). Holds `List`, and `Empty` and
 * `Status` if used.
 *
 * `manual`, not `auto`: the platform's light dismiss would close the list on a press of the
 * input itself, and of the Trigger and Clear beside it (decision 14). A press anywhere else
 * closes it here instead, reported as `'outside-press'`; Esc is the Input's. A press inside
 * keeps focus in the input.
 */
export function ComboboxPopup({
  side = 'bottom',
  align = 'start',
  className,
  children,
  render,
  ...rest
}: ComboboxPopupProps) {
  const { open, multiple, disabled, setOpen, close, isInside, anchorName, inputRef, popupRef } =
    useComboboxRootContext('Popup');

  // Light dismiss, done here: a press anywhere but the combobox's own elements closes it.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && isInside(event.target)) return;
      close('outside-press');
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, isInside, close]);
  // Re-runs the sync after the element closed itself, in case the state did not follow.
  const [, resync] = useReducer((n: number) => n + 1, 0);

  // Runs after every render: cheap, and it keeps element and state in step whichever of
  // them moved.
  useEffect(() => {
    const popup = popupRef.current;
    // jsdom, or a `render` element without the API: nothing to drive.
    if (!popup || typeof popup.showPopover !== 'function') return;

    const shown = popup.matches(':popover-open');
    if (open && !shown) {
      (popup as PopoverElement).showPopover({ source: inputRef.current ?? undefined });
      // A `beforetoggle` listener can cancel the open: report it as a close.
      if (!popup.matches(':popover-open')) setOpen(false, 'outside-press');
    } else if (!open && shown) {
      popup.hidePopover();
    }
  });

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      popover: 'manual',
      ...anchoredDataAttributes(side, align),
      ...comboboxDataAttributes({ open, multiple, disabled }),
      style: anchoredPopupStyle(anchorName, side, align),
      className,
      children,
      ref: popupRef,
      onMouseDown(event: ReactMouseEvent) {
        // Focus stays in the input, so typing carries on after a press on the list.
        event.preventDefault();
      },
      onToggle(event: SyntheticEvent) {
        // React carries a nested popover's toggle up the component tree; it isn't ours.
        if (event.target !== event.currentTarget) return;
        if ((event.nativeEvent as ToggleEvent).newState !== 'closed') return;
        // Hidden here, after the state closed: WebKit can fire this before the re-render that
        // carries the new input text, and closing again would report the text twice.
        if (!open) return;
        // Hidden by something other than this component — a script calling hidePopover().
        // Report it; if the state stays open, reopen.
        close('outside-press');
        resync();
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
