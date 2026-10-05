import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { DatePicker } from './index';
import type { DatePickerRootProps } from './DatePickerRoot';
import type { DatePickerRangeRootProps, DateRangeValue } from './DatePickerRangeRoot';
import { Calendar } from '../calendar';

/** Runs in Chromium: native date inputs, the popover API, real focus and forms. */

const focused = () => document.activeElement;
const day = (name: string) => screen.getByRole('button', { name });
const trigger = () => screen.getByRole('button', { name: /^Choose date/ });
const popup = () => screen.getByRole('dialog', { hidden: true });
const isOpen = () => popup().matches(':popover-open');

function Single(props: DatePickerRootProps & { name?: string }) {
  const { name, ...root } = props;
  return (
    <DatePicker.Root locale="en-US" {...root}>
      <label htmlFor="due">Due date</label>
      <DatePicker.Input id="due" name={name} />
      <DatePicker.Trigger />
      <DatePicker.Popup>
        <Calendar.Root locale="en-US">
          <Calendar.Heading />
          <Calendar.Grid />
        </Calendar.Root>
        {root.withTime && <DatePicker.TimeInput />}
        <DatePicker.Close>Done</DatePicker.Close>
      </DatePicker.Popup>
    </DatePicker.Root>
  );
}

function Range(props: DatePickerRangeRootProps) {
  return (
    <DatePicker.RangeRoot locale="en-US" {...props}>
      <DatePicker.StartInput name="from" />
      <DatePicker.EndInput name="to" />
      <DatePicker.Trigger />
      <DatePicker.Popup>
        <Calendar.RangeRoot locale="en-US">
          <Calendar.Grid />
        </Calendar.RangeRoot>
        {props.withTime && (
          <>
            <DatePicker.StartTimeInput />
            <DatePicker.EndTimeInput />
          </>
        )}
      </DatePicker.Popup>
    </DatePicker.RangeRoot>
  );
}

const input = () => screen.getByLabelText('Due date') as HTMLInputElement;

describe('DatePicker (browser)', () => {
  it('is a native date input, and a Trigger named with the date', () => {
    render(<Single defaultValue="2026-10-05" />);
    expect(input()).toHaveAttribute('type', 'date');
    expect(input()).toHaveValue('2026-10-05');
    expect(trigger()).toHaveAccessibleName('Choose date, Monday, October 5, 2026');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    // Closed, it is hidden, and a hidden element has no accessible name to compute.
    expect(popup()).toHaveAttribute('aria-label', 'Choose date');
  });

  it('opens on the chosen day, and a pick fills the input, closes, and returns focus', async () => {
    const onValueChange = vi.fn();
    render(<Single defaultValue="2026-10-05" onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await expect.poll(focused).toBe(day('Monday, October 5, 2026'));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}');
    expect(input()).toHaveValue('2026-10-07');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-07');
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(trigger());
    expect(trigger()).toHaveAccessibleName('Choose date, Wednesday, October 7, 2026');
  });

  it('opens on what was typed, or set on the input by a script', async () => {
    const onValueChange = vi.fn();
    render(<Single onValueChange={onValueChange} />);
    await userEvent.fill(input(), '2026-03-14');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-14');
    await userEvent.click(trigger());
    await expect.poll(focused).toBe(day('Saturday, March 14, 2026'));
    await userEvent.keyboard('{Escape}');
    // As react-hook-form's setValue does: the value, with no event.
    input().value = '2026-12-25';
    await userEvent.click(trigger());
    await expect.poll(focused).toBe(day('Friday, December 25, 2026'));
  });

  it('with withTime, is a datetime-local input, and a pick keeps the time and the Popup open', async () => {
    const onValueChange = vi.fn();
    render(<Single withTime defaultValue="2026-10-05T14:30" onValueChange={onValueChange} />);
    expect(input()).toHaveAttribute('type', 'datetime-local');
    expect(trigger()).toHaveAccessibleName(/^Choose date, Monday, October 5, 2026.*2:30/);
    await userEvent.click(trigger());
    await userEvent.click(day('Friday, October 9, 2026'));
    expect(input()).toHaveValue('2026-10-09T14:30');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-09T14:30');
    // Still open, for the time.
    expect(isOpen()).toBe(true);
  });

  it('sets the time from the Popup, and Done closes it, returning focus', async () => {
    const onValueChange = vi.fn();
    render(<Single withTime defaultValue="2026-10-05T14:30" onValueChange={onValueChange} />);
    await userEvent.click(trigger());
    const time = screen.getByLabelText('Time');
    expect(time).toHaveAttribute('type', 'time');
    expect(time).toHaveValue('14:30');
    await userEvent.fill(time, '16:45');
    expect(input()).toHaveValue('2026-10-05T16:45');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-10-05T16:45');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(isOpen()).toBe(false);
    expect(focused()).toBe(trigger());
  });

  it('keeps a time chosen before any date for the first pick, and midnight otherwise', async () => {
    const { unmount } = render(<Single withTime />);
    await userEvent.click(trigger());
    await userEvent.fill(screen.getByLabelText('Time'), '09:15');
    expect(input()).toHaveValue('');
    await expect.poll(focused).toHaveProperty('tagName', 'INPUT');
    (document.querySelector('[data-today]') as HTMLElement).click();
    expect(input().value).toMatch(/T09:15$/);
    unmount();
    render(<Single withTime />);
    await userEvent.click(trigger());
    await expect.poll(focused).toHaveProperty('tagName', 'BUTTON');
    await userEvent.keyboard('{Enter}');
    expect(input().value).toMatch(/T00:00$/);
  });

  it('reads an ISO value with a zone as local time', () => {
    const iso = '2026-10-05T22:30:00Z';
    const local = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const expected = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
    const { unmount } = render(<Single withTime defaultValue={iso} />);
    expect(input()).toHaveValue(expected);
    unmount();
    render(<Single defaultValue={iso} />);
    expect(input()).toHaveValue(expected.slice(0, 10));
  });

  it('sets min and max on the input, and the Calendar keeps to them', async () => {
    render(<Single defaultValue="2026-10-05" min="2026-10-03" max="2026-10-20" />);
    expect(input()).toHaveAttribute('min', '2026-10-03');
    expect(input()).toHaveAttribute('max', '2026-10-20');
    await userEvent.click(trigger());
    expect(day('Friday, October 2, 2026')).toHaveAttribute('data-disabled');
  });

  it('makes a typed unavailable date invalid', async () => {
    render(<Single isDateUnavailable={(d) => d === '2026-12-25'} />);
    await userEvent.fill(input(), '2026-12-25');
    expect(input().validity.customError).toBe(true);
    expect(input().validationMessage).toBe('This date is unavailable.');
    await userEvent.fill(input(), '2026-12-24');
    expect(input().validity.valid).toBe(true);
  });

  it('submits with its form, and form.reset() returns to the default and reports it', async () => {
    const onValueChange = vi.fn();
    render(
      <form data-testid="form">
        <Single name="due" defaultValue="2026-10-05" onValueChange={onValueChange} />
      </form>,
    );
    const form = screen.getByTestId('form') as HTMLFormElement;
    await userEvent.click(trigger());
    await userEvent.click(day('Friday, October 9, 2026'));
    expect(new FormData(form).get('due')).toBe('2026-10-09');
    form.reset();
    expect(input()).toHaveValue('2026-10-05');
    await expect.poll(() => onValueChange.mock.lastCall).toEqual(['2026-10-05']);
    await expect
      .poll(() => trigger().getAttribute('aria-label'))
      .toBe('Choose date, Monday, October 5, 2026');
  });

  it('follows a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('2026-10-05');
      return (
        <>
          <Single value={value} onValueChange={setValue} />
          <output data-testid="value">{String(value)}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(trigger());
    await userEvent.click(day('Tuesday, October 13, 2026'));
    expect(screen.getByTestId('value')).toHaveTextContent('2026-10-13');
    expect(input()).toHaveValue('2026-10-13');
    await userEvent.clear(input());
    expect(screen.getByTestId('value')).toHaveTextContent('null');
  });

  it('disables the input and the Trigger', () => {
    render(<Single disabled />);
    expect(input()).toBeDisabled();
    expect(trigger()).toBeDisabled();
  });
});

describe('DatePicker range (browser)', () => {
  const end = () => screen.getByLabelText('End date') as HTMLInputElement;
  const startInput = () => screen.getByLabelText('Start date') as HTMLInputElement;
  const rangeTrigger = () => screen.getByRole('button', { name: /^Choose dates/ });

  it('is two native inputs named Start date and End date, kept in step by min and max', async () => {
    render(<Range defaultValue={{ start: '2026-10-05', end: '2026-10-09' }} maxDays={7} />);
    expect(startInput()).toHaveAttribute('type', 'date');
    expect(startInput()).toHaveAttribute('max', '2026-10-09');
    expect(end()).toHaveAttribute('min', '2026-10-05');
    expect(end()).toHaveAttribute('max', '2026-10-11');
    expect(rangeTrigger()).toHaveAccessibleName('Choose dates, October 5 – 9, 2026');
    await userEvent.fill(end(), '2026-10-15');
    expect(end().validity.rangeOverflow).toBe(true);
  });

  it('picks both ends in the Calendar, reporting the range once, whole', async () => {
    const onValueChange = vi.fn();
    render(
      <form data-testid="form">
        <Range
          defaultValue={{ start: '2026-10-05', end: '2026-10-09' }}
          onValueChange={onValueChange}
        />
      </form>,
    );
    await userEvent.click(rangeTrigger());
    await expect.poll(focused).toBe(day('Monday, October 5, 2026'));
    await userEvent.click(day('Monday, October 12, 2026'));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(day('Friday, October 16, 2026'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-16' });
    const data = new FormData(screen.getByTestId('form') as HTMLFormElement);
    expect([data.get('from'), data.get('to')]).toEqual(['2026-10-12', '2026-10-16']);
    expect(popup().matches(':popover-open')).toBe(false);
  });

  it('reports each end as it is typed, with the other as it stands', async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    await userEvent.fill(startInput(), '2026-10-05');
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-05', end: null });
    await userEvent.fill(end(), '2026-10-08');
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-05', end: '2026-10-08' });
  });

  it('with withTime, picks keep each time, or start at midnight and end at 23:59', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        withTime
        defaultValue={{ start: '2026-10-05T09:15', end: null }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(rangeTrigger());
    await userEvent.click(day('Wednesday, October 7, 2026'));
    await userEvent.click(day('Saturday, October 10, 2026'));
    expect(onValueChange).toHaveBeenCalledWith({
      start: '2026-10-07T09:15',
      end: '2026-10-10T23:59',
    });
    expect(popup().matches(':popover-open')).toBe(true);
  });

  it("with withTime, sets each end's time from the Popup", async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        withTime
        defaultValue={{ start: '2026-10-05T09:15', end: '2026-10-07T18:00' }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(rangeTrigger());
    expect(screen.getByLabelText('Start time')).toHaveValue('09:15');
    expect(screen.getByLabelText('End time')).toHaveValue('18:00');
    await userEvent.fill(screen.getByLabelText('End time'), '20:30');
    expect(end()).toHaveValue('2026-10-07T20:30');
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-05T09:15',
      end: '2026-10-07T20:30',
    });
  });

  it('with maxHours, books at most that long: the calendar, a pick and a typed end all keep to it', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        withTime
        maxHours={40}
        defaultValue={{ start: '2026-10-12T14:00', end: '2026-10-12T18:00' }}
        onValueChange={onValueChange}
      />,
    );
    // Typed: no later than 40 hours after the start.
    expect(end()).toHaveAttribute('max', '2026-10-14T06:00');
    await userEvent.click(rangeTrigger());
    await userEvent.click(day('Monday, October 12, 2026'));
    // From 14:00, 40 hours reach 06:00 on Wednesday: Thursday is out of reach.
    expect(day('Wednesday, October 14, 2026')).not.toHaveAttribute('data-disabled');
    expect(day('Thursday, October 15, 2026')).toHaveAttribute('data-disabled');
    await userEvent.click(day('Wednesday, October 14, 2026'));
    // The end keeps its 18:00, which is past the cap, so it is pulled back to it.
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-12T14:00',
      end: '2026-10-14T06:00',
    });
    await userEvent.fill(screen.getByLabelText('End time'), '09:00');
    expect(end().validity.rangeOverflow).toBe(true);
  });

  it('with maxHours, pulls the end back when the start moves past the limit', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        withTime
        maxHours={40}
        defaultValue={{ start: '2026-10-16T10:00', end: '2026-10-17T22:00' }}
        onValueChange={onValueChange}
      />,
    );
    // 36 hours; moving the start to 03:00 would make it 43.
    await userEvent.fill(startInput(), '2026-10-16T03:00');
    expect(end()).toHaveValue('2026-10-17T19:00');
    expect(end().validity.valid).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: '2026-10-16T03:00',
      end: '2026-10-17T19:00',
    });
    // From the Popup's start time too.
    await userEvent.click(rangeTrigger());
    await userEvent.fill(screen.getByLabelText('Start time'), '01:00');
    expect(end()).toHaveValue('2026-10-17T17:00');
    // A start that keeps within the limit leaves the end alone.
    await userEvent.fill(screen.getByLabelText('Start time'), '05:00');
    expect(end()).toHaveValue('2026-10-17T17:00');
  });

  it('with maxDays, pulls the end back when the start moves', async () => {
    const onValueChange = vi.fn();
    render(
      <Range
        maxDays={7}
        defaultValue={{ start: '2026-10-10', end: '2026-10-16' }}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.fill(startInput(), '2026-10-05');
    expect(end()).toHaveValue('2026-10-11');
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-05', end: '2026-10-11' });
  });

  it('without withTime, ignores maxHours', async () => {
    render(<Range maxHours={40} defaultValue={{ start: '2026-10-12', end: '2026-10-13' }} />);
    expect(end()).not.toHaveAttribute('max');
    await userEvent.click(rangeTrigger());
    await userEvent.click(day('Monday, October 12, 2026'));
    expect(day('Friday, October 23, 2026')).not.toHaveAttribute('data-disabled');
  });

  it('follows a controlled range', async () => {
    function Controlled() {
      const [value, setValue] = useState<DateRangeValue>({
        start: '2026-10-05',
        end: '2026-10-06',
      });
      return (
        <>
          <Range value={value} onValueChange={setValue} />
          <output data-testid="value">{`${value.start} ${value.end}`}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(rangeTrigger());
    await userEvent.click(day('Monday, October 19, 2026'));
    await userEvent.click(day('Wednesday, October 21, 2026'));
    expect(screen.getByTestId('value')).toHaveTextContent('2026-10-19 2026-10-21');
    expect(end()).toHaveValue('2026-10-21');
  });
});
