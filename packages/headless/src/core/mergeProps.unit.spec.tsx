import { render, screen, fireEvent } from '@testing-library/react';
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

  it('runs the chain normally when nothing stops it', () => {
    const component = vi.fn();
    const merged = mergeProps({ onClick: component }, { onClick: () => {} });

    (merged.onClick as (e: unknown) => void)(syntheticEvent());
    expect(component).toHaveBeenCalledOnce();
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

  it('calling preventDefault() does not stop the chain, and still reaches the event', () => {
    const component = vi.fn();
    const preventDefault = vi.fn();
    const event = { nativeEvent: {}, preventDefault };
    const merged = mergeProps(
      { onClick: component },
      { onClick: (e: { preventDefault(): void }) => e.preventDefault() },
    );

    (merged.onClick as (e: unknown) => void)(event);
    expect(component).toHaveBeenCalledOnce();
    // The chain neither swallows the call nor wraps the method.
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(event.preventDefault).toBe(preventDefault);
  });

  it('calling stopPropagation() does not stop the chain, and still reaches the event', () => {
    // It means "do not reach ancestors"; merged handlers share one element and one
    // listener, so there is no propagation between them to stop.
    const component = vi.fn();
    const stopPropagation = vi.fn();
    const event = { nativeEvent: {}, stopPropagation };
    const merged = mergeProps(
      { onClick: component },
      { onClick: (e: { stopPropagation(): void }) => e.stopPropagation() },
    );

    (merged.onClick as (e: unknown) => void)(event);
    expect(component).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toBe(stopPropagation);
  });

  it('stopPropagation() on the native event does not stop the chain either', () => {
    const component = vi.fn();
    const stopPropagation = vi.fn();
    const merged = mergeProps(
      { onClick: component },
      {
        onClick: (e: { nativeEvent: { stopPropagation(): void } }) => {
          e.nativeEvent.stopPropagation();
        },
      },
    );

    (merged.onClick as (e: unknown) => void)({ nativeEvent: { stopPropagation } });
    expect(component).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
  });

  it('preventDefault() and preventComponentHandler() are independent signals', () => {
    const component = vi.fn();
    const preventDefault = vi.fn();
    const event = { nativeEvent: {}, preventDefault };
    const merged = mergeProps(
      { onClick: component },
      {
        onClick: (e: { preventDefault(): void; preventComponentHandler(): void }) => {
          e.preventDefault();
          e.preventComponentHandler();
        },
      },
    );

    (merged.onClick as (e: unknown) => void)(event);
    // Both were asked for, and both happened: browser action cancelled, chain stopped.
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(component).not.toHaveBeenCalled();
  });
});

/**
 * The suites above drive the chain with plain objects. These go through React and the DOM
 * instead, so the standard calls are the real ones and the browser behaviour they govern —
 * a checkbox toggling, an event bubbling — is what is actually asserted.
 */
describe('native browser behaviour', () => {
  const checkbox = (consumer: Record<string, unknown>, component = vi.fn()) => {
    const props = mergeProps({ onClick: component }, consumer);
    render(<input type="checkbox" aria-label="box" onChange={() => {}} {...props} />);
    return { box: screen.getByLabelText('box') as HTMLInputElement, component };
  };

  it('toggles the checkbox when nobody cancels it', () => {
    // The control for the test below: without it, asserting `false` proves nothing.
    const { box, component } = checkbox({ onClick: () => {} });

    fireEvent.click(box);
    expect(box.checked).toBe(true);
    expect(component).toHaveBeenCalledOnce();
  });

  it("preventDefault() in a chained handler still cancels the browser's action", () => {
    const { box, component } = checkbox({
      onClick: (event: React.MouseEvent) => event.preventDefault(),
    });

    fireEvent.click(box);
    // Cancelled for real — the merge did not swallow the call.
    expect(box.checked).toBe(false);
    // And the component's handler ran anyway: the two signals are independent.
    expect(component).toHaveBeenCalledOnce();
  });

  it('preventComponentHandler() leaves the browser action alone', () => {
    const { box, component } = checkbox({
      onClick: (event: React.MouseEvent & { preventComponentHandler(): void }) =>
        event.preventComponentHandler(),
    });

    fireEvent.click(box);
    expect(component).not.toHaveBeenCalled();
    // The other direction of the same independence: the checkbox still toggles.
    expect(box.checked).toBe(true);
  });

  it('applies both when preventDefault() and preventComponentHandler() are called together', () => {
    const { box, component } = checkbox({
      onClick: (event: React.MouseEvent & { preventComponentHandler(): void }) => {
        event.preventDefault();
        event.preventComponentHandler();
      },
    });

    fireEvent.click(box);
    // Neither call weakens the other: the browser action is cancelled and the chain stops.
    expect(box.checked).toBe(false);
    expect(component).not.toHaveBeenCalled();
  });

  it('stopPropagation() in a chained handler still stops the event reaching a parent', () => {
    const parent = vi.fn();
    const component = vi.fn();
    const props = mergeProps(
      { onClick: component },
      { onClick: (event: React.MouseEvent) => event.stopPropagation() },
    );
    render(
      // A bare click target for propagation, not a control anyone interacts with.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={parent}>
        <button type="button" {...props}>
          go
        </button>
      </div>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(parent).not.toHaveBeenCalled();
    // Bubbling stopped, but the chain on this element ran in full.
    expect(component).toHaveBeenCalledOnce();
  });

  it('lets the event reach a parent when nothing stops it', () => {
    const parent = vi.fn();
    const props = mergeProps({ onClick: vi.fn() }, { onClick: vi.fn() });
    render(
      // A bare click target for propagation, not a control anyone interacts with.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={parent}>
        <button type="button" {...props}>
          go
        </button>
      </div>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(parent).toHaveBeenCalledOnce();
  });
});
