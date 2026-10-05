import { datePart, formatDate, formatDateRange } from '../calendar/dates';

const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/** An input value read out in full: the date, and the time when there is one. */
export function describeValue(value: string, locale: string | undefined): string {
  const day = datePart(value) ?? value;
  if (value.length === 10) return formatDate(day, locale, LONG_DATE);
  // A date-time with no zone parses as local time, and formats in it.
  return new Intl.DateTimeFormat(locale, {
    ...LONG_DATE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

/** A range read out: "October 1 – 7, 2026", or with times, each end in full. */
export function describeRange(start: string, end: string, locale: string | undefined): string {
  if (start.length === 10 && end.length === 10) {
    return formatDateRange(start, end, locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return `${describeValue(start, locale)} – ${describeValue(end, locale)}`;
}
