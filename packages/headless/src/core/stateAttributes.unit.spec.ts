import { describe, it, expect } from 'vitest';
import { getStateAttributes, booleanAttribute } from './stateAttributes';

describe('getStateAttributes', () => {
  it('returns nothing without a mapping', () => {
    expect(getStateAttributes({ checked: true }, undefined)).toEqual({});
  });

  it('ignores state fields the mapping does not cover', () => {
    expect(
      getStateAttributes(
        { checked: true, value: 'x' },
        { checked: booleanAttribute('data-checked') },
      ),
    ).toEqual({ 'data-checked': '' });
  });

  it('lets one field emit several attributes', () => {
    const attrs = getStateAttributes(
      { status: 'open' as const },
      { status: (v) => ({ 'data-status': v, 'data-open': '' }) },
    );
    expect(attrs).toEqual({ 'data-status': 'open', 'data-open': '' });
  });

  it('keeps a third state addressable via mutually exclusive attributes', () => {
    // With only data-checked, :not([data-checked]) would match unchecked AND
    // indeterminate — the reason both sides are emitted.
    const mapping = {
      checked: (v: boolean | 'indeterminate') =>
        v === 'indeterminate'
          ? { 'data-indeterminate': '' }
          : v
            ? { 'data-checked': '' }
            : { 'data-unchecked': '' },
    };
    expect(getStateAttributes({ checked: 'indeterminate' as const }, mapping)).toEqual({
      'data-indeterminate': '',
    });
    expect(getStateAttributes({ checked: false }, mapping)).toEqual({ 'data-unchecked': '' });
  });
});

describe('booleanAttribute', () => {
  it('emits the true attribute, and the false one when given', () => {
    const both = booleanAttribute('data-checked', 'data-unchecked');
    expect(both(true)).toEqual({ 'data-checked': '' });
    expect(both(false)).toEqual({ 'data-unchecked': '' });
  });

  it('emits nothing when false and no false attribute is given', () => {
    expect(booleanAttribute('data-disabled')(false)).toBeNull();
  });
});
