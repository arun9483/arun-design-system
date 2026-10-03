import { describe, it, expect } from 'vitest';
import { graceArea, isPointInPolygon } from './pointerIntent';

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height }) as DOMRect;

describe('graceArea', () => {
  const popup = rect(200, 0, 100, 200);

  it('covers the path from the exit point to a popup on the right', () => {
    const area = graceArea({ x: 190, y: 100 }, popup);
    expect(isPointInPolygon({ x: 195, y: 100 }, area)).toBe(true);
    expect(isPointInPolygon({ x: 198, y: 20 }, area)).toBe(true);
    expect(isPointInPolygon({ x: 191, y: 20 }, area)).toBe(false);
    expect(isPointInPolygon({ x: 180, y: 100 }, area)).toBe(false);
  });

  it('points the other way when the popup opened on the left', () => {
    const area = graceArea({ x: 310, y: 100 }, popup);
    expect(isPointInPolygon({ x: 305, y: 100 }, area)).toBe(true);
    expect(isPointInPolygon({ x: 320, y: 100 }, area)).toBe(false);
  });
});

describe('isPointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('tells inside from outside', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
    expect(isPointInPolygon({ x: 5, y: -1 }, [])).toBe(false);
  });
});
