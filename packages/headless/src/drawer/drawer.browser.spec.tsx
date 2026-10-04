import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from './index';
import type { DrawerSide } from './DrawerPopup';
import type { ComponentEvent } from '../core/mergeProps';

/**
 * Runs in Chromium: the drawer is a modal <dialog>, and the swipe reads geometry. Pointer
 * events are dispatched by hand, as a finger or a mouse would send them.
 */

const SIZE = { inlineSize: '300px', blockSize: '200px', padding: 0, margin: 0 };

function Basic({
  side,
  onOpenChange,
  onClick,
  children,
}: {
  side?: DrawerSide;
  onOpenChange?: (open: boolean) => void;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Drawer.Root defaultOpen onOpenChange={onOpenChange}>
      <Drawer.Popup data-testid="popup" side={side} style={SIZE}>
        <Drawer.Title>Filters</Drawer.Title>
        <button onClick={onClick}>Apply</button>
        {children}
      </Drawer.Popup>
    </Drawer.Root>
  );
}

const popup = () => screen.getByTestId('popup') as HTMLDialogElement;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function pointer(type: string, target: Element, x: number, y: number) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 7,
      isPrimary: true,
      button: 0,
      pointerType: 'touch',
      clientX: x,
      clientY: y,
    }),
  );
}

/** The middle of an element: where a press starts. */
function centre(element: Element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Presses `target`, moves by each [dx, dy] in turn and lifts. `settle` waits before the
 * last move, so the release is slow: distance alone decides, not a flick.
 */
async function swipe(
  target: Element,
  moves: [number, number][],
  { settle = false, end = 'pointerup' } = {},
) {
  const { x, y } = centre(target);
  pointer('pointerdown', target, x, y);
  for (const [index, [dx, dy]] of moves.entries()) {
    if (settle && index === moves.length - 1) await wait(120);
    pointer('pointermove', target, x + dx, y + dy);
  }
  const [dx, dy] = moves.at(-1) ?? [0, 0];
  pointer(end, target, x + dx, y + dy);
}

describe('Drawer', () => {
  it('is a modal dialog at the bottom by default, named by its Title', () => {
    render(<Basic />);
    expect(popup().matches(':modal')).toBe(true);
    expect(popup()).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(popup());
  });

  it('follows a swipe toward closing with --drawer-swipe and data-swiping', () => {
    render(<Basic />);
    const { x, y } = centre(popup());
    pointer('pointerdown', popup(), x, y);
    pointer('pointermove', popup(), x, y + 30);

    expect(popup()).toHaveAttribute('data-swiping');
    expect(popup().style.getPropertyValue('--drawer-swipe')).toBe('30px');

    pointer('pointermove', popup(), x, y - 40);
    // Past the open position there is nowhere to go: it stops at 0.
    expect(popup().style.getPropertyValue('--drawer-swipe')).toBe('0px');
  });

  it('closes when released past a quarter of its size', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await swipe(
      popup(),
      [
        [0, 20],
        [0, 50],
        [0, 60],
      ],
      { settle: true },
    );

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(popup().open).toBe(false);
    expect(popup()).not.toHaveAttribute('data-swiping');
    expect(popup().style.getPropertyValue('--drawer-swipe')).toBe('');
  });

  it('settles back open after a short, slow swipe', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await swipe(
      popup(),
      [
        [0, 20],
        [0, 30],
        [0, 31],
      ],
      { settle: true },
    );

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(popup().open).toBe(true);
    expect(popup()).not.toHaveAttribute('data-swiping');
    expect(popup().style.getPropertyValue('--drawer-swipe')).toBe('');
  });

  it('closes on a fast flick, however short', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await swipe(popup(), [
      [0, 12],
      [0, 30],
    ]);

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('ignores a press that sets off toward opening, or across the axis', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await swipe(popup(), [
      [0, -20],
      [0, 120],
    ]);
    await swipe(popup(), [
      [20, 2],
      [20, 120],
    ]);

    expect(popup()).not.toHaveAttribute('data-swiping');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not close on a cancelled pointer', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await swipe(
      popup(),
      [
        [0, 20],
        [0, 150],
      ],
      { end: 'pointercancel' },
    );

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(popup()).not.toHaveAttribute('data-swiping');
  });

  it.each([
    ['top', [0, -150]],
    ['right', [150, 0]],
    ['left', [-150, 0]],
  ] as const)('closes from the %s side by swiping toward it', async (side, [dx, dy]) => {
    const onOpenChange = vi.fn();
    render(<Basic side={side} onOpenChange={onOpenChange} />);
    expect(popup()).toHaveAttribute('data-side', side);

    await swipe(popup(), [
      [dx / 10, dy / 10],
      [dx, dy],
    ]);

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('leaves scrolled content to scroll until it reaches its edge', async () => {
    const onOpenChange = vi.fn();
    render(
      <Basic onOpenChange={onOpenChange}>
        <div data-testid="list" style={{ blockSize: '80px', overflow: 'auto' }}>
          <div style={{ blockSize: '400px' }}>Long list</div>
        </div>
      </Basic>,
    );
    const list = screen.getByTestId('list');

    list.scrollTop = 100;
    await swipe(list, [
      [0, 20],
      [0, 150],
    ]);
    expect(onOpenChange).not.toHaveBeenCalled();

    list.scrollTop = 0;
    await swipe(list, [
      [0, 20],
      [0, 150],
    ]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('leaves a press in a text field to the text', async () => {
    const onOpenChange = vi.fn();
    render(
      <Basic onOpenChange={onOpenChange}>
        <input aria-label="Search" />
      </Basic>,
    );

    await swipe(screen.getByRole('textbox'), [
      [0, 20],
      [0, 150],
    ]);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('swallows the click a swipe ends with, but not a tap', async () => {
    const onClick = vi.fn();
    render(<Basic onClick={onClick} />);
    const apply = screen.getByRole('button', { name: 'Apply' });

    await swipe(
      apply,
      [
        [0, 20],
        [0, 30],
        [0, 31],
      ],
      { settle: true },
    );
    apply.click();
    expect(onClick).not.toHaveBeenCalled();

    await userEvent.click(apply);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('lets the next tap through after a swipe that sent no click, as touch does', async () => {
    const onClick = vi.fn();
    render(<Basic onClick={onClick} />);
    const apply = screen.getByRole('button', { name: 'Apply' });

    // A finger that moves sends no click when it lifts.
    await swipe(
      popup(),
      [
        [0, 20],
        [0, 30],
        [0, 31],
      ],
      { settle: true },
    );
    await userEvent.click(apply);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('slides back open when a controlled parent refuses the close', async () => {
    const onOpenChange = vi.fn();
    function Refusing() {
      const [open] = useState(true);
      return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
          <Drawer.Popup data-testid="popup" style={SIZE}>
            <Drawer.Title>Unsaved</Drawer.Title>
          </Drawer.Popup>
        </Drawer.Root>
      );
    }
    render(<Refusing />);

    await swipe(popup(), [
      [0, 20],
      [0, 150],
    ]);

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(popup().open).toBe(true);
    expect(popup().style.getPropertyValue('--drawer-swipe')).toBe('');
  });

  it("runs a consumer's handler first, which can stop the swipe", async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer.Root defaultOpen onOpenChange={onOpenChange}>
        <Drawer.Popup
          data-testid="popup"
          style={SIZE}
          onPointerDown={(event) => (event as unknown as ComponentEvent).preventComponentHandler()}
        >
          <Drawer.Title>Locked</Drawer.Title>
        </Drawer.Popup>
      </Drawer.Root>,
    );

    await swipe(popup(), [
      [0, 20],
      [0, 150],
    ]);

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
