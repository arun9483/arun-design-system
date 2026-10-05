import { describe, it, expect } from 'vitest';
import {
  addDays,
  addMonths,
  clamp,
  dayOfWeek,
  daysBetween,
  addHours,
  daysSpanned,
  endOfMonth,
  firstDayOfWeekFor,
  timePart,
  toInputValue,
} from './dates';

describe('calendar dates', () => {
  it('adds days across months, years and a daylight-saving change', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('adds months, keeping to the last day of a shorter one', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2026-03-15', -3)).toBe('2025-12-15');
    expect(addMonths('2026-10-05', 12)).toBe('2027-10-05');
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
  });

  it('counts days between dates, and the weekday', () => {
    expect(daysBetween('2026-10-01', '2026-10-07')).toBe(6);
    expect(daysBetween('2026-10-07', '2026-10-01')).toBe(-6);
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31);
    expect(dayOfWeek('2026-10-05')).toBe(1);
    expect(clamp('2026-01-01', '2026-02-01', undefined)).toBe('2026-02-01');
  });

  it('reads ISO 8601 as the value a native input holds', () => {
    expect(toInputValue('2026-10-05', false)).toBe('2026-10-05');
    expect(toInputValue('2026-10-05', true)).toBe('2026-10-05T00:00');
    expect(toInputValue('2026-10-05T14:30:59.123', true)).toBe('2026-10-05T14:30');
    expect(toInputValue('2026-10-05 14:30', true)).toBe('2026-10-05T14:30');
    expect(toInputValue('2026-10-05T14:30', false)).toBe('2026-10-05');
    expect(toInputValue('', true)).toBeNull();
    expect(toInputValue(null, true)).toBeNull();
    expect(toInputValue('next tuesday', true)).toBeNull();
    // With a zone, converted to the device's local time.
    const zoned = new Date('2026-10-05T23:30:00+05:30');
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(toInputValue('2026-10-05T23:30:00+05:30', true)).toBe(
      `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}T${pad(zoned.getHours())}:${pad(zoned.getMinutes())}`,
    );
    expect(timePart('2026-10-05T14:30')).toBe('14:30');
    expect(timePart('2026-10-05')).toBeNull();
  });

  it("finds the locale's first day of the week", () => {
    expect(firstDayOfWeekFor('en-US')).toBe(0);
    expect(firstDayOfWeekFor('en-GB')).toBe(1);
    expect(firstDayOfWeekFor('de-DE')).toBe(1);
    expect(firstDayOfWeekFor('ar-EG')).toBe(6);
  });

  it('adds hours to a local date-time, and counts the days a span touches', () => {
    expect(addHours('2026-10-12T14:00', 40)).toBe('2026-10-14T06:00');
    expect(addHours('2026-10-12T23:30', 1.5)).toBe('2026-10-13T01:00');
    expect(daysSpanned('14:00', 40)).toBe(3);
    expect(daysSpanned('00:00', 24)).toBe(2);
    expect(daysSpanned('09:00', 8)).toBe(1);
  });
});
