import { render, screen, within } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from './index';
import type { CalendarRootProps } from './CalendarRoot';
import type { CalendarRangeRootProps } from './CalendarRangeRoot';
import { today } from './dates';

/** Runs in Chromium: real focus, keys, Intl and layout direction. */

const focused = () => document.activeElement;
const day = (name: string | RegExp) => screen.getByRole('button', { name });
const heading = () => screen.getByTestId('heading');

function Single(props: CalendarRootProps) {
  return (
    <Calendar.Root locale="en-US" {...props}>
      <Calendar.PrevButton />
      <Calendar.Heading data-testid="heading" />
      <Calendar.NextButton />
      <Calendar.Grid />
    </Calendar.Root>
  );
}

function Range(props: CalendarRangeRootProps) {
  return (
    <Calendar.RangeRoot locale="en-US" {...props}>
      <Calendar.Heading data-testid="heading" />
      <Calendar.Grid />
    </Calendar.RangeRoot>
  );
}

describe('Calendar (browser)', () => {
  it('is a grid of the month, its weekdays named, each day a button named with its date', () => {
    render(<Single defaultValue="2026-10-05" />);
    const grid = screen.getByRole('grid', { name: 'October 2026' });
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
    expect(headers[0]).toHaveAttribute('abbr', 'Sunday');
    expect(heading()).toHaveTextContent('October 2026');
    expect(heading()).toHaveAttribute('aria-live', 'polite');
    const selected = day('Monday, October 5, 2026');
    expect(selected).toHaveAttribute('data-selected');
    expect(selected.closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(day('Tuesday, October 6, 2026').closest('td')).toHaveAttribute('aria-selected', 'false');
    // Oct 1 2026 is a Thursday: four blanks before it.
    expect(within(grid).getAllByRole('row')[1]?.querySelectorAll('td button')).toHaveLength(3);
  });

  it("starts the week on the locale's first day, or on firstDayOfWeek", () => {
    const { unmount } = render(<Single locale="en-GB" defaultValue="2026-10-05" />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Mon');
    unmount();
    render(<Single firstDayOfWeek={6} defaultValue="2026-10-05" />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sat');
  });

  it('names months, weekdays and digits in the locale', () => {
    render(<Single locale="de-DE" defaultValue="2026-10-05" />);
    expect(heading()).toHaveTextContent('Oktober 2026');
    expect(screen.getByRole('grid', { name: 'Oktober 2026' })).toBeInTheDocument();
    expect(day('Montag, 5. Oktober 2026')).toBeInTheDocument();
  });

  it('marks today with aria-current', () => {
    render(<Single />);
    const marked = document.querySelector('[aria-current="date"]');
    expect(marked).toHaveAttribute('data-today');
    expect(marked).toHaveAttribute('tabindex', '0');
    expect(Number(marked?.textContent)).toBe(Number(today().slice(8)));
  });

  it('is one Tab stop, the selected day, and moves by day, week, month and year', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Single defaultValue="2026-01-31" />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(focused()).toBe(day('Saturday, January 31, 2026'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(day('Friday, January 30, 2026'));
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(day('Friday, January 23, 2026'));
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe(day('Sunday, January 18, 2026'));
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(day('Saturday, January 24, 2026'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    // Into February: the grid follows.
    expect(focused()).toBe(day('Saturday, February 7, 2026'));
    expect(heading()).toHaveTextContent('February 2026');
    await userEvent.keyboard('{PageUp}');
    expect(focused()).toBe(day('Wednesday, January 7, 2026'));
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(focused()).toBe(day('Thursday, January 7, 2027'));
  });

  it('moves to the last day of a shorter month with Page Down', async () => {
    render(<Single defaultValue="2026-01-31" />);
    day('Saturday, January 31, 2026').focus();
    await userEvent.keyboard('{PageDown}');
    expect(focused()).toBe(day('Saturday, February 28, 2026'));
  });

  it('swaps Left and Right in a right-to-left calendar', async () => {
    render(<Single defaultValue="2026-10-05" dir="rtl" />);
    day('Monday, October 5, 2026').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(day('Tuesday, October 6, 2026'));
  });

  it('selects a day with a click or Enter', async () => {
    const onValueChange = vi.fn();
    render(<Single defaultValue="2026-10-05" onValueChange={onValueChange} />);
    await userEvent.click(day('Friday, October 9, 2026'));
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-09');
    expect(day('Friday, October 9, 2026')).toHaveAttribute('data-selected');
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-10');
  });

  it('keeps days outside min and max, and unavailable ones, focusable but not selectable', async () => {
    const onValueChange = vi.fn();
    render(
      <Single
        defaultValue="2026-10-14"
        min="2026-10-05"
        max="2026-10-20"
        isDateUnavailable={(d) => d === '2026-10-15'}
        onValueChange={onValueChange}
      />,
    );
    const unavailable = day('Thursday, October 15, 2026');
    expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    expect(unavailable).toHaveAttribute('data-disabled');
    expect(day('Sunday, October 4, 2026')).toHaveAttribute('data-disabled');
    // Forced: Playwright will not press an aria-disabled element, a user can.
    await userEvent.click(unavailable, { force: true });
    expect(onValueChange).not.toHaveBeenCalled();
    // The arrows pass over it, and stop at min and max.
    day('Wednesday, October 14, 2026').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(unavailable);
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(day('Tuesday, October 20, 2026'));
    await userEvent.keyboard('{PageUp}');
    expect(focused()).toBe(day('Monday, October 5, 2026'));
  });

  it('pages with Previous and Next, which stop at the months of min and max', async () => {
    render(<Single defaultValue="2026-10-05" min="2026-09-10" max="2026-11-10" />);
    const previous = screen.getByRole('button', { name: 'Previous month' });
    const next = screen.getByRole('button', { name: 'Next month' });
    await userEvent.click(next);
    expect(heading()).toHaveTextContent('November 2026');
    expect(next).toBeDisabled();
    // The Tab stop moves with the page.
    expect(day('Thursday, November 5, 2026')).toHaveAttribute('tabindex', '0');
    await userEvent.click(previous);
    await userEvent.click(previous);
    expect(heading()).toHaveTextContent('September 2026');
    expect(previous).toBeDisabled();
    expect(day('Saturday, September 5, 2026').getAttribute('tabindex')).toBe('-1');
    expect(day('Thursday, September 10, 2026')).toHaveAttribute('tabindex', '0');
  });

  it('shows several months, the arrows crossing between their grids', async () => {
    render(
      <Calendar.Root locale="en-US" defaultValue="2026-10-31" months={2}>
        <Calendar.Heading data-testid="heading" />
        <Calendar.Grid />
        <Calendar.Grid offset={1} />
      </Calendar.Root>,
    );
    expect(heading()).toHaveTextContent('October – November 2026');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    day('Saturday, October 31, 2026').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(day('Sunday, November 1, 2026'));
    expect(heading()).toHaveTextContent('October – November 2026');
    await userEvent.keyboard('{PageDown}');
    expect(heading()).toHaveTextContent('November – December 2026');
  });

  it('picks a range in two presses, previewing it in between, in either order', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        defaultValue={{ start: '2026-10-01', end: '2026-10-03' }}
        onValueChange={onValueChange}
      />,
    );
    expect(day('Friday, October 2, 2026')).toHaveAttribute('data-in-range');
    expect(day('Thursday, October 1, 2026')).toHaveAttribute('data-range-start');
    expect(screen.getByRole('grid')).toBeInTheDocument();
    await userEvent.click(day('Friday, October 16, 2026'));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.hover(day('Monday, October 12, 2026'));
    expect(day('Tuesday, October 13, 2026')).toHaveAttribute('data-in-range');
    expect(day('Monday, October 12, 2026')).toHaveAttribute('data-range-start');
    expect(day('Friday, October 16, 2026')).toHaveAttribute('data-range-end');
    expect(day('Friday, October 2, 2026')).not.toHaveAttribute('data-in-range');
    await userEvent.click(day('Monday, October 12, 2026'));
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-16' });
    expect(day('Wednesday, October 14, 2026').closest('td')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('with maxDays, disables the days a range cannot reach once it has started', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        defaultValue={{ start: '2026-10-01', end: '2026-10-01' }}
        maxDays={7}
        onValueChange={onValueChange}
      />,
    );
    expect(day('Saturday, October 17, 2026')).not.toHaveAttribute('data-disabled');
    await userEvent.click(day('Saturday, October 10, 2026'));
    // Seven days counting both ends, either side of the first pick.
    expect(day('Saturday, October 3, 2026')).toHaveAttribute('data-disabled');
    expect(day('Sunday, October 4, 2026')).not.toHaveAttribute('data-disabled');
    expect(day('Friday, October 16, 2026')).not.toHaveAttribute('data-disabled');
    expect(day('Saturday, October 17, 2026')).toHaveAttribute('data-disabled');
    await userEvent.click(day('Saturday, October 17, 2026'), { force: true });
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(day('Friday, October 16, 2026'));
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-10', end: '2026-10-16' });
    // Complete, nothing is out of reach again.
    expect(day('Saturday, October 17, 2026')).not.toHaveAttribute('data-disabled');
  });

  it('does not let a range span a day that cannot be picked', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        defaultValue={{ start: '2026-10-01', end: '2026-10-01' }}
        isDateUnavailable={(d) => d === '2026-10-13'}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(day('Saturday, October 10, 2026'));
    expect(day('Monday, October 12, 2026')).not.toHaveAttribute('data-disabled');
    expect(day('Wednesday, October 14, 2026')).toHaveAttribute('data-disabled');
    // Earlier days stay in reach: nothing unavailable lies between.
    expect(day('Thursday, October 1, 2026')).not.toHaveAttribute('data-disabled');
    await userEvent.click(day('Wednesday, October 14, 2026'), { force: true });
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(day('Monday, October 12, 2026'));
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-10', end: '2026-10-12' });
    // From the other side, the unavailable day blocks going back.
    await userEvent.click(day('Friday, October 16, 2026'));
    expect(day('Wednesday, October 14, 2026')).not.toHaveAttribute('data-disabled');
    expect(day('Monday, October 12, 2026')).toHaveAttribute('data-disabled');
  });

  it('picks a one-day range by pressing the same day twice', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        defaultValue={{ start: '2026-10-01', end: '2026-10-01' }}
        onValueChange={onValueChange}
      />,
    );
    day('Monday, October 5, 2026').focus();
    await userEvent.keyboard('{Enter}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-05', end: '2026-10-05' });
  });
});
