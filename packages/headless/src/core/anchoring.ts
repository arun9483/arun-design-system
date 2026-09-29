/**
 * CSS anchor positioning for popups placed beside a trigger — Popover and Tooltip
 * (decision 12). Internal: shared between components, not exported (decision 9).
 *
 * The trigger carries a generated `anchor-name`; the popup names it in `position-anchor`
 * and is placed by `position-area`, flipping across the axis it opens along when there is
 * no room. All inline, so the browser keeps it attached with nothing measured.
 */

export type AnchorSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchorAlign = 'start' | 'center' | 'end';

/** A CSS dashed-ident from React's id, which may hold characters an ident cannot. */
export function anchorNameFor(id: string): string {
  return `--hl-anchor-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * `side` and `align` as a `position-area`. A single side keyword spans the whole cross axis,
 * which centres the popup on the trigger; `span-*` starts it at one of the trigger's edges.
 */
const POSITION_AREA: Record<AnchorSide, Record<AnchorAlign, string>> = {
  bottom: { start: 'bottom span-right', center: 'bottom', end: 'bottom span-left' },
  top: { start: 'top span-right', center: 'top', end: 'top span-left' },
  right: { start: 'right span-bottom', center: 'right', end: 'right span-top' },
  left: { start: 'left span-bottom', center: 'left', end: 'left span-top' },
};

/** The popup's inline placement styles. */
export function anchoredPopupStyle(anchorName: string, side: AnchorSide, align: AnchorAlign) {
  return {
    positionAnchor: anchorName,
    positionArea: POSITION_AREA[side][align],
    // Flip across the axis it opens on; the other axis is left alone.
    positionTryFallbacks: side === 'top' || side === 'bottom' ? 'flip-block' : 'flip-inline',
  };
}

/** `data-side` / `data-align`: the request, not where a fallback moved it (unobservable). */
export function anchoredDataAttributes(side: AnchorSide, align: AnchorAlign) {
  return { 'data-side': side, 'data-align': align };
}

/** TypeScript's DOM types predate `showPopover`'s `source` option. */
export type PopoverElement = HTMLElement & {
  showPopover(options?: { source?: HTMLElement }): void;
};
