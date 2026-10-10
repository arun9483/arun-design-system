import { render, screen } from '@testing-library/react';
import { server, userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { RangeSlider } from './index';
import type { RangeSliderRootProps } from './index';

/** Runs in a real browser: the platform's own range keys, thumbs, and presses on the track. */

// Stacked as a styling layer must: only the thumbs take a press, the raised one on top.
const css = `
  .rs { position: relative; inline-size: 316px; block-size: 20px; }
  .rs input { position: absolute; inset: 0; margin: 0; inline-size: 100%; block-size: 100%;
    appearance: none; background: none; pointer-events: none; }
  .rs input[data-raised] { z-index: 1; }
  .rs input::-webkit-slider-thumb { appearance: none; pointer-events: auto;
    inline-size: 16px; block-size: 16px; background: black; }
  .rs input::-moz-range-thumb { pointer-events: auto; inline-size: 16px; block-size: 16px;
    background: black; border: 0; border-radius: 0; }
`;

// 0 to 300 in steps of 10 over 300px of travel: a value is a pixel past the thumb's half width.
const xOf = (value: number) => 8 + value;

function Price(props: RangeSliderRootProps) {
  return (
    <>
      <style>{css}</style>
      <RangeSlider.Root className="rs" aria-label="Price" min={0} max={300} step={10} {...props}>
        <RangeSlider.StartInput />
        <RangeSlider.EndInput />
      </RangeSlider.Root>
    </>
  );
}

// vitest's dragAndDrop does not move a Firefox range thumb inside its test iframe, though the
// same drag does on a page (checked with Playwright on the docs site). Firefox still runs the
// keys, the track press and the Tab order here; the order and the raised thumb are unit-tested.
const dragTest = it.skipIf(server.browser === 'firefox');

const start = () => screen.getByRole<HTMLInputElement>('slider', { name: 'Minimum' });
const end = () => screen.getByRole<HTMLInputElement>('slider', { name: 'Maximum' });
const group = () => screen.getByRole('group', { name: 'Price' });

describe('RangeSlider (browser)', () => {
  it('moves each thumb with the platform’s keys, by the step, never past the other', async () => {
    const onValueChange = vi.fn();
    render(<Price defaultValue={[100, 120]} onValueChange={onValueChange} />);
    start().focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(start()).toHaveValue('110');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(start()).toHaveValue('120');
    await userEvent.keyboard('{Home}');
    expect(start()).toHaveValue('0');
    end().focus();
    await userEvent.keyboard('{End}');
    expect(end()).toHaveValue('300');
    expect(onValueChange).toHaveBeenLastCalledWith([0, 300]);
  });

  dragTest('drags a thumb no further than the other', async () => {
    render(<Price defaultValue={[50, 200]} />);
    await userEvent.dragAndDrop(group(), group(), {
      sourcePosition: { x: xOf(50), y: 10 },
      targetPosition: { x: xOf(280), y: 10 },
    });
    expect(start()).toHaveValue('200');
    expect(end()).toHaveValue('200');
  });

  it('moves the nearer thumb to a press on the track, and focuses it', async () => {
    const onValueChange = vi.fn();
    render(<Price defaultValue={[50, 200]} onValueChange={onValueChange} />);
    await userEvent.click(group(), { position: { x: xOf(240), y: 10 } });
    expect(onValueChange).toHaveBeenLastCalledWith([50, 240]);
    expect(document.activeElement).toBe(end());
    await userEvent.click(group(), { position: { x: xOf(90), y: 10 } });
    expect(onValueChange).toHaveBeenLastCalledWith([90, 240]);
    expect(document.activeElement).toBe(start());
  });

  dragTest('lets the start be dragged back off the end when both are at the top', async () => {
    render(<Price defaultValue={[300, 300]} />);
    await userEvent.dragAndDrop(group(), group(), {
      sourcePosition: { x: xOf(300), y: 10 },
      targetPosition: { x: xOf(150), y: 10 },
    });
    expect(start()).toHaveValue('150');
    expect(end()).toHaveValue('300');
  });

  it('is two Tab stops, start then end', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Price />
      </>,
    );
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(start());
    await userEvent.tab();
    expect(document.activeElement).toBe(end());
  });
});
