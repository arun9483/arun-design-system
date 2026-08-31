import { describe, it, expect, vi } from 'vitest';
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

  it('chains event handlers rather than replacing them', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      { onClick: () => calls.push('component') },
      { onClick: () => calls.push('consumer') },
    );
    (merged.onClick as () => void)();
    // Right to left — see the handler chain suite below for why.
    expect(calls).toEqual(['consumer', 'component']);
  });

  it('does not treat non-handler `on*` keys as handlers', () => {
    expect(mergeProps({ once: 'a' }, { once: 'b' })).toEqual({ once: 'b' });
  });
});

describe('handler chain', () => {
  /** React attaches `nativeEvent`; the chain uses it to tell events from plain values. */
  const syntheticEvent = () => ({ nativeEvent: {} }) as Record<string, unknown>;

  it('runs the consumer handler before the component one', () => {
    const order: string[] = [];
    const merged = mergeProps(
      { onClick: () => order.push('component') },
      { onClick: () => order.push('consumer') },
    );

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    expect(order).toEqual(['consumer', 'component']);
  });

  it("lets the consumer stop the component's handler", () => {
    const component = vi.fn();
    const merged = mergeProps(
      { onClick: component },
      {
        onClick: (event: { preventComponentHandler(): void }) => {
          event.preventComponentHandler();
        },
      },
    );

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    expect(component).not.toHaveBeenCalled();
  });

  it('runs the component handler when the consumer does not stop it', () => {
    const component = vi.fn();
    const merged = mergeProps({ onClick: component }, { onClick: () => {} });

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    expect(component).toHaveBeenCalledOnce();
  });

  it('stops every earlier handler, not just the next one', () => {
    const first = vi.fn();
    const second = vi.fn();
    const merged = mergeProps(
      { onClick: first },
      { onClick: second },
      {
        onClick: (event: { preventComponentHandler(): void }) => {
          event.preventComponentHandler();
        },
      },
    );

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    expect(second).not.toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
  });

  it('always runs every handler when the argument is not an event', () => {
    // onCheckedChange matches the on* naming but is called with a boolean, so there is
    // nothing to attach the signal to.
    const component = vi.fn();
    const merged = mergeProps({ onCheckedChange: component }, { onCheckedChange: () => {} });

    (merged.onCheckedChange as (v: boolean) => void)(true);
    expect(component).toHaveBeenCalledWith(true);
  });

  it('leaves preventDefault alone', () => {
    const component = vi.fn();
    const merged = mergeProps(
      { onClick: component },
      { onClick: (event: { defaultPrevented: boolean }) => (event.defaultPrevented = true) },
    );

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    // Cancelling the browser's default action says nothing about the handler chain.
    expect(component).toHaveBeenCalledOnce();
  });
});
