import { useEffect, useReducer, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useDialogRootContext } from './DialogRootContext';
import { dialogDataAttributes } from './dialogDataAttributes';

type DialogPopupOwnProps = {
  /**
   * Element to render instead of the default `<dialog>`. Props and ref are merged onto it.
   *
   * The `<dialog>` is what supplies `showModal()` — the top layer, backdrop, focus trap
   * and inert page; what `render` produces instead is the consumer's choice.
   */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type DialogPopupProps = DialogPopupOwnProps &
  Omit<ComponentPropsWithRef<'dialog'>, keyof DialogPopupOwnProps | 'open'>;

/** A point outside the dialog's own box is on the backdrop. */
function isOnBackdrop(dialog: HTMLElement, x: number, y: number): boolean {
  const rect = dialog.getBoundingClientRect();
  return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
}

/**
 * The dialog: a native `<dialog>`, opened with `showModal()` whenever the Root is open
 * and closed with `close()` when it is not. State drives the element, never the reverse.
 *
 * Every way the platform closes a dialog is turned into a request through the Root's
 * setter instead, so a controlled parent can refuse it:
 *
 * - **Esc** fires `cancel`, which is prevented, then reported.
 * - **A backdrop click** is a click on the `<dialog>` itself outside its box. The press
 *   has to start there too, so a text selection dragged out of the dialog does not close it.
 * - **`<form method="dialog">`**, or a `cancel` the browser will not let be prevented,
 *   closes the element first; the `close` event reports it, and the element reopens if
 *   the state stays open.
 *
 * It stays mounted while closed — a closed `<dialog>` is `display: none` — so its content
 * keeps its state between openings. Without a `Dialog.Title`, give it a name with
 * `aria-label`.
 */
export function DialogPopup({ className, children, render, ...rest }: DialogPopupProps) {
  const { open, setOpen, closeOnBackdropClick, popupId, titleId } = useDialogRootContext('Popup');
  const elementRef = useRef<HTMLElement | null>(null);
  const pressedBackdrop = useRef(false);
  // Re-runs the sync after the element closed itself, in case the state did not follow.
  const [, resync] = useReducer((n: number) => n + 1, 0);

  // Runs after every render: cheap, and it keeps element and state in step whichever
  // of them moved.
  useEffect(() => {
    const dialog = elementRef.current as HTMLDialogElement | null;
    // A `render` element that is not a <dialog> has neither method; nothing to drive.
    if (!dialog || typeof dialog.showModal !== 'function') return;

    if (open && !dialog.open) {
      dialog.showModal();
      // A `beforetoggle` listener can cancel the open. Then it is a refused open: report
      // it, so the state — and the Trigger's aria-expanded — follow the element.
      if (!dialog.open) setOpen(false);
    } else if (!open && dialog.open) dialog.close();
  });

  const element = useRender({
    render,
    defaultTagName: 'dialog',
    props: {
      id: popupId,
      'aria-labelledby': titleId,
      ...dialogDataAttributes({ open }),
      className,
      children,
      ref: elementRef,
      onCancel(event: SyntheticEvent) {
        // React carries a nested dialog's cancel up the component tree; it isn't ours.
        if (event.target !== event.currentTarget) return;
        // A consumer's preventDefault() means what it means natively: stay open.
        if (event.defaultPrevented) return;
        // Esc: the Root decides, not the platform.
        event.preventDefault();
        setOpen(false);
      },
      onClose(event: SyntheticEvent) {
        if (event.target !== event.currentTarget) return;
        // The element closed itself. Report it; if the state stays open, reopen.
        setOpen(false);
        resync();
      },
      onPointerDown(event: ReactPointerEvent) {
        const dialog = elementRef.current;
        pressedBackdrop.current =
          dialog !== null &&
          event.target === dialog &&
          isOnBackdrop(dialog, event.clientX, event.clientY);
      },
      onClick(event: ReactMouseEvent) {
        const dialog = elementRef.current;
        const onBackdrop =
          pressedBackdrop.current &&
          dialog !== null &&
          event.target === dialog &&
          isOnBackdrop(dialog, event.clientX, event.clientY);
        pressedBackdrop.current = false;
        if (onBackdrop && closeOnBackdropClick) setOpen(false);
      },
    },
    consumerProps: rest as UnknownProps,
  });

  return element;
}
