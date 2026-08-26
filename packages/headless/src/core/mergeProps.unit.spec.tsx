import { describe, it, expect } from 'vitest';
import { mergeProps } from './mergeProps';

describe('mergeProps', () => {
  it('skips undefined so a later object cannot clobber an earlier value', () => {
    expect(mergeProps({ id: 'a' }, { id: undefined })).toEqual({ id: 'a' });
  });

  it('lets a later object win for plain values', () => {
    expect(
      mergeProps({ 'aria-label': 'from component' }, { 'aria-label': 'from consumer' }),
    ).toEqual({ 'aria-label': 'from consumer' });
  });

  it('concatenates className and shallow-merges style', () => {
    expect(
      mergeProps(
        { className: 'chip', style: { color: 'red', margin: 0 } },
        { className: 'accent', style: { color: 'blue' } },
      ),
    ).toEqual({ className: 'chip accent', style: { color: 'blue', margin: 0 } });
  });

  it('chains event handlers in order rather than replacing them', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push('component') },
      { onClick: () => calls.push('consumer') },
    );
    (merged.onClick as () => void)();
    expect(calls).toEqual(['component', 'consumer']);
  });

  it('does not treat non-handler `on*` keys as handlers', () => {
    expect(mergeProps({ once: 'a' }, { once: 'b' })).toEqual({ once: 'b' });
  });
});
