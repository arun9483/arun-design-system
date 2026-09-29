import { describe, it, expect } from 'vitest';
import { rovingIndex } from './rovingFocus';

const h = { count: 4, orientation: 'horizontal' as const, rtl: false };

describe('rovingIndex', () => {
  it('moves along a horizontal group with Left and Right, wrapping', () => {
    expect(rovingIndex('ArrowRight', { ...h, current: 1 })).toBe(2);
    expect(rovingIndex('ArrowRight', { ...h, current: 3 })).toBe(0);
    expect(rovingIndex('ArrowLeft', { ...h, current: 0 })).toBe(3);
  });

  it('ignores Up and Down in a horizontal group', () => {
    expect(rovingIndex('ArrowDown', { ...h, current: 1 })).toBeNull();
  });

  it('uses Up and Down in a vertical group, and ignores Left and Right', () => {
    const v = { ...h, orientation: 'vertical' as const };
    expect(rovingIndex('ArrowDown', { ...v, current: 1 })).toBe(2);
    expect(rovingIndex('ArrowUp', { ...v, current: 0 })).toBe(3);
    expect(rovingIndex('ArrowRight', { ...v, current: 1 })).toBeNull();
  });

  it('swaps Left and Right when right-to-left', () => {
    const r = { ...h, rtl: true };
    expect(rovingIndex('ArrowLeft', { ...r, current: 1 })).toBe(2);
    expect(rovingIndex('ArrowRight', { ...r, current: 1 })).toBe(0);
  });

  it('goes to the ends with Home and End', () => {
    expect(rovingIndex('Home', { ...h, current: 2 })).toBe(0);
    expect(rovingIndex('End', { ...h, current: 0 })).toBe(3);
  });

  it('returns null for other keys, and for an empty group', () => {
    expect(rovingIndex('Enter', { ...h, current: 1 })).toBeNull();
    expect(rovingIndex('ArrowRight', { ...h, count: 0, current: -1 })).toBeNull();
  });
});
