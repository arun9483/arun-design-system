import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { DialogPopup, type DialogPopupProps } from '../dialog/DialogPopup';
import { useDialogRootContext } from '../dialog/DialogRootContext';
import { useMergedProps, type UnknownProps } from '../core/mergeProps';

/** The edge of the viewport a drawer is attached to, and slides back to when it closes. */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

type DrawerPopupOwnProps = {
  /** The edge it comes in from, and the direction a swipe closes it. Defaults to `bottom`. */
  side?: DrawerSide;
};

export type DrawerPopupProps = DrawerPopupOwnProps & Omit<DialogPopupProps, 'side'>;

/** Movement before a press becomes a swipe, so a tap or a small wobble stays a tap. */
const SLOP = 8;
/** A release past this share of the drawer's size closes it… */
const DISTANCE = 0.25;
/** …and so does a flick faster than this, in px per ms, however short. */
const VELOCITY = 0.5;

type Gesture = {
  pointerId: number;
  x: number;
  y: number;
  /** null until the press moves past SLOP; then whether it became a swipe. */
  swiping: boolean | null;
  offset: number;
  /** The last two samples, for the release velocity. */
  last: { offset: number; time: number };
  previous: { offset: number; time: number };
};

/** Distance moved toward closing: positive in the close direction, along the side's axis. */
function towardClose(side: DrawerSide, dx: number, dy: number): number {
  if (side === 'bottom') return dy;
  if (side === 'top') return -dy;
  if (side === 'right') return dx;
  return -dx;
}

function isVertical(side: DrawerSide): boolean {
  return side === 'top' || side === 'bottom';
}

/**
 * Whether content between the press and the drawer can still scroll the other way — away
 * from closing. Then the gesture is the content's: a list scrolled halfway down scrolls up,
 * rather than the drawer closing under it. Only at the edge does the drawer take over.
 */
function contentCanScroll(target: Element, drawer: HTMLElement, side: DrawerSide): boolean {
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (node instanceof HTMLElement) {
      if (side === 'bottom' && node.scrollTop > 0) return true;
      if (side === 'top' && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
      if (side === 'right' && node.scrollLeft > 0) return true;
      if (side === 'left' && node.scrollLeft + node.clientWidth < node.scrollWidth - 1) return true;
    }
    if (node === drawer) break;
  }
  return false;
}

/** A press in a text field or on selected text is for the text, not a swipe. */
function isForText(target: Element): boolean {
  return (
    target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') !==
    null
  );
}

/**
 * A drawer: a Dialog.Popup — the same native `<dialog>` opened with `showModal()`, with the
 * same top layer, focus trap, Esc and backdrop handling — attached to one edge of the
 * viewport, and closed by swiping it back toward that edge (decision 23).
 *
 * The swipe is read from pointer events, so it works with a finger, a pen or a mouse. While
 * it moves, the distance is `--drawer-swipe` on the element, in px toward closing, and the
 * element has `data-swiping`, so a stylesheet can follow the finger with no transition. On
 * release, a swipe past a quarter of the drawer's size, or a fast flick, asks the Root to
 * close through the one setter every close takes, so a controlled parent can refuse it;
 * anything else lets it settle back.
 *
 * A touch on scrolling content is the content's until it reaches its edge: the page is kept
 * from scrolling only once the press has become a swipe.
 */
export function DrawerPopup({ side = 'bottom', ...rest }: DrawerPopupProps) {
  const { setOpen } = useDialogRootContext('Popup');
  const elementRef = useRef<HTMLElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  // A swipe ends in a click on whatever is under the pointer; that click is not a press.
  const swallowClick = useRef(false);

  // A browser decides to scroll on the first touchmove, and pointer events then stop with
  // pointercancel. Cancelling that touchmove keeps the page still and the pointer events
  // coming — but only once the press is a swipe, so content still scrolls by touch. React
  // listens to touchmove passively, so this is a native listener.
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    function onTouchMove(event: TouchEvent) {
      if (gesture.current?.swiping && event.cancelable) event.preventDefault();
    }
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => element.removeEventListener('touchmove', onTouchMove);
  }, []);

  function show(offset: number) {
    elementRef.current?.style.setProperty('--drawer-swipe', `${offset}px`);
  }

  function settle() {
    const element = elementRef.current;
    gesture.current = null;
    if (!element) return;
    element.style.removeProperty('--drawer-swipe');
    element.removeAttribute('data-swiping');
  }

  function onPointerDown(event: ReactPointerEvent) {
    // A touch swipe sends no click when it lifts, so a click still owed to the last swipe
    // would be this press's own. A new press settles the debt.
    swallowClick.current = false;
    const element = elementRef.current;
    const target = event.target as Element;
    if (!element || !event.isPrimary || event.button !== 0) return;
    // A press on the backdrop is Dialog's: the dialog itself is the target, outside its box.
    if (target === element) {
      const rect = element.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
    }
    if (isForText(target) || contentCanScroll(target, element, side)) return;
    const now = event.timeStamp;
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      swiping: null,
      offset: 0,
      last: { offset: 0, time: now },
      previous: { offset: 0, time: now },
    };
  }

  function onPointerMove(event: ReactPointerEvent) {
    const current = gesture.current;
    const element = elementRef.current;
    if (!current || !element || event.pointerId !== current.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;

    if (current.swiping === null) {
      if (Math.hypot(dx, dy) < SLOP) return;
      // It is a swipe only if it set off along the drawer's axis, toward closing.
      const along = isVertical(side) ? Math.abs(dy) > Math.abs(dx) : Math.abs(dx) > Math.abs(dy);
      if (!along || towardClose(side, dx, dy) <= 0) {
        gesture.current = null;
        return;
      }
      current.swiping = true;
      element.setAttribute('data-swiping', '');
      // Keeps the moves coming if the finger leaves the drawer. A pointer already lifted
      // cannot be captured; the swipe then simply ends with it.
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // Nothing to capture.
      }
      // Text the press began in would otherwise be selected as the finger moves.
      window.getSelection()?.removeAllRanges();
    }

    // Toward opening, it stops at the open position: there is nowhere further to go.
    current.offset = Math.max(0, towardClose(side, dx, dy));
    // Events can share a timestamp; then the newest position replaces the last sample
    // rather than shifting it, so the velocity is never measured over no time.
    if (event.timeStamp !== current.last.time) current.previous = current.last;
    current.last = { offset: current.offset, time: event.timeStamp };
    show(current.offset);
  }

  function onPointerEnd(event: ReactPointerEvent) {
    const current = gesture.current;
    const element = elementRef.current;
    if (!current || !element || event.pointerId !== current.pointerId) return;
    if (!current.swiping) {
      gesture.current = null;
      return;
    }
    swallowClick.current = true;
    const rect = element.getBoundingClientRect();
    const size = isVertical(side) ? rect.height : rect.width;
    const elapsed = current.last.time - current.previous.time;
    const moved = current.last.offset - current.previous.offset;
    // Movement in no measurable time is as fast as it gets.
    const velocity = elapsed > 0 ? moved / elapsed : moved > 0 ? Infinity : 0;
    const close =
      event.type === 'pointerup' && (current.offset > size * DISTANCE || velocity > VELOCITY);
    // Settle first: the closing transition then runs from where the finger let go, and a
    // refused close slides back open.
    settle();
    if (close) setOpen(false);
  }

  function onClickCapture(event: ReactMouseEvent) {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // The drawer's props first and the consumer's last, as everywhere: refs are merged, and the
  // consumer's handlers run first and can stop these (decision 8).
  const props = useMergedProps(
    {
      ref: elementRef,
      'data-side': side,
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
    rest as UnknownProps,
  );

  return <DialogPopup {...(props as DialogPopupProps)} />;
}
