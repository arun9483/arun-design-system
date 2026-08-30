import { describe, expect, it, vi } from 'vitest';
import { useButton } from './useButton';

describe('useButton', () => {
  it('returns props untouched when not disabled', () => {
    const onClick = vi.fn();
    const props = { href: '/x', onClick, id: 'a' };
    expect(useButton({ native: false, props })).toBe(props);
  });

  it('leans on the platform for a native button', () => {
    const onClick = vi.fn();
    expect(useButton({ disabled: true, native: true, props: { onClick } })).toEqual({
      onClick,
      disabled: true,
      'data-disabled': '',
    });
  });

  it('synthesises the disabled state for anything else', () => {
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const result = useButton({
      disabled: true,
      native: false,
      props: { href: '/x', onClick, onKeyDown: onClick, onFocus, id: 'a' },
    });

    // the navigation target and activation handlers are gone
    expect(result).not.toHaveProperty('href');
    expect(result).not.toHaveProperty('onClick');
    expect(result).not.toHaveProperty('onKeyDown');
    // unrelated props and non-activation handlers survive
    expect(result.id).toBe('a');
    expect(result.onFocus).toBe(onFocus);
    expect(result).toMatchObject({ 'aria-disabled': true, 'data-disabled': '', tabIndex: -1 });
  });

  it('emits data-disabled for both element kinds, so one selector styles them', () => {
    // Called unconditionally and not in a loop: the `use` prefix opts this into
    // rules-of-hooks, which is deliberate — see useRender's note on the convention.
    const nativeResult = useButton({ disabled: true, native: true, props: {} });
    const synthesised = useButton({ disabled: true, native: false, props: {} });

    expect(nativeResult).toHaveProperty('data-disabled', '');
    expect(synthesised).toHaveProperty('data-disabled', '');
  });
});
