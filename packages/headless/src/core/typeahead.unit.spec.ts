import { createElement } from 'react';
import { describe, it, expect } from 'vitest';
import { textOf, typeaheadIndex } from './typeahead';

const labels = ['Copy', 'Cut', 'Delete', 'Deploy', 'Écrire', ''];

describe('typeaheadIndex', () => {
  it('finds the first item starting with the search, from no focus', () => {
    expect(typeaheadIndex(labels, -1, 'd')).toBe(2);
    expect(typeaheadIndex(labels, -1, 'dep')).toBe(3);
  });

  it('moves past the current item on one character, wrapping', () => {
    expect(typeaheadIndex(labels, 0, 'c')).toBe(1);
    expect(typeaheadIndex(labels, 1, 'c')).toBe(0);
  });

  it('cycles on a repeated character, as native menus do', () => {
    expect(typeaheadIndex(labels, 2, 'dd')).toBe(3);
    expect(typeaheadIndex(labels, 3, 'ddd')).toBe(2);
  });

  it('stays on the current item while a longer search still matches it', () => {
    expect(typeaheadIndex(labels, 2, 'de')).toBe(2);
    expect(typeaheadIndex(labels, 2, 'depl')).toBe(3);
  });

  it('ignores case and accents', () => {
    expect(typeaheadIndex(labels, -1, 'ECR')).toBe(4);
    expect(typeaheadIndex(labels, -1, 'écr')).toBe(4);
  });

  it('returns null when nothing matches, or there is nothing to search', () => {
    expect(typeaheadIndex(labels, 0, 'z')).toBeNull();
    expect(typeaheadIndex([], -1, 'a')).toBeNull();
    expect(typeaheadIndex(labels, -1, '')).toBeNull();
  });
});

describe('textOf', () => {
  it('collects strings and numbers through nested elements', () => {
    const node = ['Page ', 2, createElement('span', null, createElement('b', null, ' of 5'))];
    expect(textOf(node)).toBe('Page 2 of 5');
  });

  it('skips what is not text', () => {
    expect(textOf([createElement('svg'), null, false, 'Edit'])).toBe('Edit');
  });
});
