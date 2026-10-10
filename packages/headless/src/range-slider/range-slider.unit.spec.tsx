import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { RangeSlider } from './index';
import type { RangeSliderRootProps, RangeSliderValue } from './index';

function Price(props: RangeSliderRootProps) {
  return (
    <form data-testid="form">
      <RangeSlider.Root aria-label="Price" min={0} max={1000} step={10} {...props}>
        <RangeSlider.StartInput name="priceMin" />
        <RangeSlider.EndInput name="priceMax" />
      </RangeSlider.Root>
    </form>
  );
}

const start = () => screen.getByRole<HTMLInputElement>('slider', { name: 'Minimum' });
const end = () => screen.getByRole<HTMLInputElement>('slider', { name: 'Maximum' });
const group = () => screen.getByRole('group', { name: 'Price' });
const submitted = () => [...new FormData(screen.getByTestId<HTMLFormElement>('form')).entries()];
const move = (input: HTMLInputElement, to: number) =>
  fireEvent.change(input, { target: { value: String(to) } });

describe('RangeSlider', () => {
  it('is a named group of two native range inputs over the same bounds', () => {
    render(<Price defaultValue={[200, 800]} />);
    expect(group()).toBeInTheDocument();
    for (const input of [start(), end()]) {
      expect(input).toHaveAttribute('type', 'range');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '1000');
      expect(input).toHaveAttribute('step', '10');
    }
    expect(start()).toHaveValue('200');
    expect(end()).toHaveValue('800');
  });

  it('spans the whole track when no range is given', () => {
    render(<Price />);
    expect(start()).toHaveValue('0');
    expect(end()).toHaveValue('1000');
  });

  it('takes a name of your own over its default', () => {
    render(
      <RangeSlider.Root aria-label="Age">
        <RangeSlider.StartInput aria-label="Youngest" />
        <RangeSlider.EndInput aria-label="Oldest" />
      </RangeSlider.Root>,
    );
    expect(screen.getByRole('slider', { name: 'Youngest' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Oldest' })).toBeInTheDocument();
  });

  it('submits each end under its own name', () => {
    render(<Price defaultValue={[200, 800]} />);
    expect(submitted()).toEqual([
      ['priceMin', '200'],
      ['priceMax', '800'],
    ]);
  });

  it('reports the whole range when either end moves', () => {
    const onValueChange = vi.fn();
    render(<Price defaultValue={[200, 800]} onValueChange={onValueChange} />);
    move(start(), 300);
    expect(onValueChange).toHaveBeenLastCalledWith([300, 800]);
    move(end(), 600);
    expect(onValueChange).toHaveBeenLastCalledWith([300, 600]);
    expect(submitted()).toEqual([
      ['priceMin', '300'],
      ['priceMax', '600'],
    ]);
  });

  it('stops a thumb where the other stands, rather than letting it pass', () => {
    const onValueChange = vi.fn();
    render(<Price defaultValue={[200, 800]} onValueChange={onValueChange} />);
    move(start(), 900);
    expect(start()).toHaveValue('800');
    expect(onValueChange).toHaveBeenLastCalledWith([800, 800]);
    move(end(), 100);
    expect(end()).toHaveValue('800');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('colours the stretch between the thumbs through two custom properties', () => {
    render(<Price defaultValue={[250, 750]} />);
    expect(group().style.getPropertyValue('--range-slider-start')).toBe('0.25');
    expect(group().style.getPropertyValue('--range-slider-end')).toBe('0.75');
  });

  it('raises the thumb that can still move when the two meet', () => {
    const { unmount } = render(<Price defaultValue={[0, 0]} />);
    expect(end()).toHaveAttribute('data-raised');
    expect(start()).not.toHaveAttribute('data-raised');
    unmount();
    render(<Price defaultValue={[1000, 1000]} />);
    expect(start()).toHaveAttribute('data-raised');
    expect(end()).not.toHaveAttribute('data-raised');
  });

  it('follows the parent when controlled, but still reports the intent', () => {
    const onValueChange = vi.fn();
    render(<Price value={[200, 800]} onValueChange={onValueChange} />);
    move(start(), 400);
    expect(onValueChange).toHaveBeenLastCalledWith([400, 800]);
    expect(start()).toHaveValue('200');
  });

  it('moves when the parent moves it', () => {
    function Parent() {
      const [value, setValue] = useState<RangeSliderValue>([200, 800]);
      return (
        <>
          <button type="button" onClick={() => setValue([100, 500])}>
            Budget
          </button>
          <Price value={value} onValueChange={setValue} />
        </>
      );
    }
    render(<Parent />);
    fireEvent.click(screen.getByRole('button', { name: 'Budget' }));
    expect(start()).toHaveValue('100');
    expect(end()).toHaveValue('500');
  });

  it('disables both inputs, and marks the group', () => {
    render(<Price disabled />);
    expect(start()).toBeDisabled();
    expect(end()).toBeDisabled();
    expect(group()).toHaveAttribute('data-disabled');
    expect(submitted()).toEqual([]);
  });

  it('moves the nearer thumb to a press on the track', () => {
    const onValueChange = vi.fn();
    render(<Price defaultValue={[200, 800]} onValueChange={onValueChange} />);
    // jsdom has no layout: the track is 1000px wide at x 0, so a pixel is a unit.
    vi.spyOn(group(), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 20));
    fireEvent.pointerDown(group(), { button: 0, clientX: 704 });
    expect(onValueChange).toHaveBeenLastCalledWith([200, 700]);
    expect(document.activeElement).toBe(end());
    fireEvent.pointerDown(group(), { button: 0, clientX: 96 });
    expect(onValueChange).toHaveBeenLastCalledWith([100, 700]);
    expect(document.activeElement).toBe(start());
  });

  describe('form reset', () => {
    async function reset() {
      await act(async () => {
        screen.getByTestId<HTMLFormElement>('form').reset();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }

    it('returns to the range it mounted with, and reports it', async () => {
      const onValueChange = vi.fn();
      render(<Price defaultValue={[200, 800]} onValueChange={onValueChange} />);
      move(start(), 400);
      await reset();
      expect(start()).toHaveValue('200');
      expect(onValueChange).toHaveBeenLastCalledWith([200, 800]);
    });

    it('reports nothing when nothing moved', async () => {
      const onValueChange = vi.fn();
      render(<Price defaultValue={[200, 800]} onValueChange={onValueChange} />);
      await reset();
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  it('tells you when an input is used outside Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<RangeSlider.StartInput />)).toThrow(
      '<RangeSlider.StartInput> must be rendered inside <RangeSlider.Root>.',
    );
  });
});
