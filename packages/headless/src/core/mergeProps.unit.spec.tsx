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
    // Right to left: the consumer runs first, which is what lets it stop the ones behind it.
    expect(calls).toEqual(['consumer', 'component']);
  });

  it('does not treat non-handler `on*` keys as handlers', () => {
    expect(mergeProps({ once: 'a' }, { once: 'b' })).toEqual({ once: 'b' });
  });
});

describe('handler chain', () => {
  /** React attaches `nativeEvent`; the chain uses it to tell events from plain values. */
  const syntheticEvent = () => ({ nativeEvent: {} }) as Record<string, unknown>;

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
});

/**
 * The suites above drive the chain with plain objects. These go through React and the DOM
 * instead, so the standard calls are the real ones and the browser behaviour they govern —
 * a checkbox ticking, an event bubbling — is what is actually asserted.
 *
 * Every test renders the same shape: a checkbox whose onClick is merged from a component
 * handler and a consumer handler, sitting inside a bare parent that catches the event on its
 * way up. One click then reports all three outcomes — the tick, the parent, the chain — so
 * each test can say what its signal changed and, just as importantly, what it left alone.
 */
describe('native browser behaviour', () => {
  it('ticks the box, reaches the parent, and runs the chain when nothing cancels anything', () => {
    const parent = vi.fn();
    const component = vi.fn();
    const props = mergeProps({ onClick: component }, { onClick: () => {} });
    render(
      // A bare wrapper, there only to catch the event on its way up.
      <div role="presentation" onClick={parent}>
        <input type="checkbox" aria-label="box" onChange={() => {}} {...props} />
      </div>,
    );
    const box = screen.getByLabelText('box') as HTMLInputElement;

    fireEvent.click(box);
    // The control for the tests below: without it, asserting the opposite proves nothing.
    expect(box.checked).toBe(true);
    expect(parent).toHaveBeenCalledOnce();
    expect(component).toHaveBeenCalledOnce();
  });

  it('preventDefault() in a chained handler stops the tick but not the bubbling', () => {
    const parent = vi.fn();
    let defaultPreventedWhenComponentRan: boolean | undefined;
    const component = vi.fn((event: React.MouseEvent) => {
      defaultPreventedWhenComponentRan = event.defaultPrevented;
    });
    const props = mergeProps(
      { onClick: component },
      { onClick: (event: React.MouseEvent) => event.preventDefault() },
    );
    render(
      // A bare wrapper, there only to catch the event on its way up.
      <div role="presentation" onClick={parent}>
        <input type="checkbox" aria-label="box" onChange={() => {}} {...props} />
      </div>,
    );
    const box = screen.getByLabelText('box') as HTMLInputElement;

    fireEvent.click(box);
    // The default action here is ticking the box, and it was cancelled.
    expect(box.checked).toBe(false);
    // Cancelling it does not stop the event: the parent still hears the click,
    expect(parent).toHaveBeenCalledOnce();
    // and the chain on this element ran in full: it never consults defaultPrevented, so an
    // already-cancelled event is no reason to stop.
    expect(component).toHaveBeenCalledOnce();
    expect(defaultPreventedWhenComponentRan).toBe(true);
  });

  it('preventComponentHandler() stops the component handler and nothing else', () => {
    const parent = vi.fn();
    const component = vi.fn();
    const props = mergeProps(
      { onClick: component },
      {
        onClick: (event: React.MouseEvent & { preventComponentHandler(): void }) =>
          event.preventComponentHandler(),
      },
    );
    render(
      // A bare wrapper, there only to catch the event on its way up.
      <div role="presentation" onClick={parent}>
        <input type="checkbox" aria-label="box" onChange={() => {}} {...props} />
      </div>,
    );
    const box = screen.getByLabelText('box') as HTMLInputElement;

    fireEvent.click(box);
    // The chain stopped before the component's handler,
    expect(component).not.toHaveBeenCalled();
    // but the browser action and the trip upwards are untouched: the signals are independent.
    expect(box.checked).toBe(true);
    expect(parent).toHaveBeenCalledOnce();
  });

  it('applies both when preventDefault() and preventComponentHandler() are called together', () => {
    const parent = vi.fn();
    const component = vi.fn();
    const props = mergeProps(
      { onClick: component },
      {
        onClick: (event: React.MouseEvent & { preventComponentHandler(): void }) => {
          event.preventDefault();
          event.preventComponentHandler();
        },
      },
    );
    render(
      // A bare wrapper, there only to catch the event on its way up.
      <div role="presentation" onClick={parent}>
        <input type="checkbox" aria-label="box" onChange={() => {}} {...props} />
      </div>,
    );
    const box = screen.getByLabelText('box') as HTMLInputElement;

    fireEvent.click(box);
    // Neither call weakens the other: the tick is cancelled and the chain stops.
    expect(box.checked).toBe(false);
    expect(component).not.toHaveBeenCalled();
    // Neither of them is about propagation, so the parent still hears the click.
    expect(parent).toHaveBeenCalledOnce();
  });

  it('stopPropagation() in a chained handler stops the bubbling and nothing else', () => {
    const parent = vi.fn();
    const component = vi.fn();
    const props = mergeProps(
      { onClick: component },
      { onClick: (event: React.MouseEvent) => event.stopPropagation() },
    );
    render(
      // A bare wrapper, there only to catch the event on its way up.
      <div role="presentation" onClick={parent}>
        <input type="checkbox" aria-label="box" onChange={() => {}} {...props} />
      </div>,
    );
    const box = screen.getByLabelText('box') as HTMLInputElement;

    fireEvent.click(box);
    // The event never reached the parent — stopped for real, the merge did not swallow the call.
    expect(parent).not.toHaveBeenCalled();
    // Only the trip upwards is stopped: the box still ticks and the chain ran in full.
    expect(box.checked).toBe(true);
    expect(component).toHaveBeenCalledOnce();
  });
});
