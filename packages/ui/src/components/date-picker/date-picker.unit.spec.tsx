import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DatePicker, DateRangePicker } from './index';
import { Calendar, RangeCalendar } from '../calendar';
import { Field } from '../field';

// Behaviour, dates and the keyboard are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds: classes, where props land, and the parts it places.
describe('Calendar (ui)', () => {
  it('draws Previous, the heading and Next, then a grid per month', () => {
    render(<Calendar locale="en-US" defaultValue="2026-10-05" months={2} className="wide" />);
    const grids = screen.getAllByRole('grid');
    expect(grids).toHaveLength(2);
    expect(grids[0]?.closest('.calendar')).toHaveClass('calendar', 'calendar-multiple', 'wide');
    expect(grids[1]).toHaveAccessibleName('November 2026');
    expect(screen.getByRole('button', { name: 'Previous month' })).toHaveClass('calendar-nav');
    expect(screen.getByRole('button', { name: 'Next month' })).toHaveClass('calendar-nav-next');
  });

  it('is a range calendar too', () => {
    render(
      <RangeCalendar locale="en-US" defaultValue={{ start: '2026-10-05', end: '2026-10-07' }} />,
    );
    expect(screen.getByRole('button', { name: 'Tuesday, October 6, 2026' })).toHaveAttribute(
      'data-in-range',
    );
    expect(screen.getByRole('grid').closest('.calendar')).not.toHaveClass('calendar-multiple');
  });
});

describe('DatePicker (ui)', () => {
  it('puts className on the box and every other prop on the input', () => {
    render(<DatePicker className="wide" aria-label="Due" name="due" required withTime />);
    const input = screen.getByLabelText('Due');
    expect(input).toHaveAttribute('type', 'datetime-local');
    expect(input).toHaveAttribute('name', 'due');
    expect(input).toBeRequired();
    expect(input).toHaveClass('date-picker-input');
    expect(input.parentElement).toHaveClass('date-picker', 'wide');
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveClass('date-picker-trigger');
  });

  it('with withTime, adds the time field and Done to the popup', () => {
    render(<DatePicker aria-label="Starts" withTime defaultValue="2026-10-05T09:30" />);
    const time = screen.getByLabelText('Time');
    expect(time).toHaveAttribute('type', 'time');
    expect(time).toHaveValue('09:30');
    expect(time).toHaveClass('date-picker-time-input');
    expect(screen.getByRole('button', { name: 'Done', hidden: true })).toHaveClass('btn-primary');
  });

  it('without withTime, has no time field', () => {
    render(<DatePicker aria-label="Due" />);
    expect(screen.queryByLabelText('Time')).toBeNull();
  });

  it('takes a Field: the label, the description and the invalid state reach the input', () => {
    render(
      <Field.Root invalid>
        <Field.Label>Due date</Field.Label>
        <Field.Control render={<DatePicker />} />
        <Field.Description>Within the month.</Field.Description>
      </Field.Root>,
    );
    const input = screen.getByLabelText('Due date');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Within the month.');
  });

  it('a range is a named group of two inputs, the start taking the id', () => {
    render(
      <DateRangePicker
        aria-label="Trip dates"
        id="trip"
        required
        startInputProps={{ name: 'from' }}
        endInputProps={{ name: 'to' }}
      />,
    );
    const group = screen.getByRole('group', { name: 'Trip dates' });
    expect(group).toHaveClass('date-picker', 'date-range-picker');
    const start = screen.getByLabelText('Start date');
    const end = screen.getByLabelText('End date');
    expect(start).toHaveAttribute('id', 'trip');
    expect(start).toHaveAttribute('name', 'from');
    expect(end).toHaveAttribute('name', 'to');
    expect(end).toBeRequired();
  });

  it('a range with times has a start and an end time field', () => {
    render(
      <DateRangePicker
        aria-label="Booking"
        withTime
        defaultValue={{ start: '2026-10-05T14:00', end: '2026-10-07T11:00' }}
      />,
    );
    expect(screen.getByLabelText('Start time')).toHaveValue('14:00');
    expect(screen.getByLabelText('End time')).toHaveValue('11:00');
  });
});
