/**
 * Pointer intent for nested popups: the area a pointer crosses on its way from a trigger to the
 * popup it opened, so the popup does not close while the pointer passes over other items on
 * the way. Menu's submenus first; internal (decision 9).
 *
 * Measures the popup's box when the pointer leaves the trigger. That is geometry the pointer
 * moves through, never state (decision 10), and nothing is positioned from it (decision 12).
 */

export type Point = { x: number; y: number };

/**
 * The triangle from where the pointer left the trigger to the popup's near edge — widened by
 * a few pixels behind the pointer, so a shaky hand that starts slightly backwards stays inside.
 */
export function graceArea(exit: Point, popup: DOMRect): Point[] {
  const toRight = popup.left >= exit.x;
  const edge = toRight ? popup.left : popup.right;
  const back = toRight ? -5 : 5;
  return [
    { x: exit.x + back, y: exit.y - 5 },
    { x: edge, y: popup.top },
    { x: edge, y: popup.bottom },
    { x: exit.x + back, y: exit.y + 5 },
  ];
}

/** Whether the point lies inside the polygon, by ray casting. */
export function isPointInPolygon({ x, y }: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}
