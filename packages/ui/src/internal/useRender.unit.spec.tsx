import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from '../components/chip';
import { mergeProps } from './useRender';

describe('mergeProps', () => {
  it('skips undefined so a later object cannot clobber an earlier value', () => {
    expect(mergeProps({ id: 'a' }, { id: undefined })).toEqual({ id: 'a' });
  });

  it('concatenates className and shallow-merges style', () => {
    expect(
      mergeProps(
        { className: 'chip', style: { color: 'red', margin: 0 } },
        { className: 'accent', style: { color: 'blue' } },
      ),
    ).toEqual({
      className: 'chip accent',
      style: { color: 'blue', margin: 0 },
    });
  });

  it('chains event handlers in order', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push('first') },
      { onClick: () => calls.push('second') },
    );
    (merged.onClick as () => void)();
    expect(calls).toEqual(['first', 'second']);
  });

  it('does not treat non-handler `on*` keys as handlers', () => {
    const once = 'value';
    expect(mergeProps({ once }, { once: 'other' })).toEqual({ once: 'other' });
  });
});

describe('ref merging', () => {
  it('gives the node to both the component ref and the render element ref', () => {
    const objectRef: { current: HTMLElement | null } = { current: null };
    const seen: (Element | null)[] = [];

    render(
      <Chip ref={objectRef} render={<span ref={(node) => void seen.push(node)} />}>
        Tag
      </Chip>,
    );

    expect(objectRef.current).toBe(screen.getByText('Tag'));
    expect(seen[0]).toBe(screen.getByText('Tag'));
  });

  it('clears an object ref and a legacy callback ref on unmount', () => {
    const objectRef: { current: HTMLElement | null } = { current: null };
    const seen: (Element | null)[] = [];

    const { unmount } = render(
      <Chip ref={objectRef} render={<span ref={(node) => void seen.push(node)} />}>
        Tag
      </Chip>,
    );
    unmount();

    expect(objectRef.current).toBeNull();
    // A legacy callback ref returns nothing, so it must still be called with null.
    expect(seen.at(-1)).toBeNull();
  });
});
