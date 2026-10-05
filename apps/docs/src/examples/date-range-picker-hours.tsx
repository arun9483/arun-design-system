import { useState } from 'react';
import { DateRangePicker, Text, type DateRangePickerProps } from '@arun-dev/ui';

type Range = NonNullable<DateRangePickerProps['value']>;

/** Whole hours between two local date-times. */
const hoursBetween = (start: string, end: string) =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / 3_600_000);

export default function DateRangePickerHours() {
  const [booking, setBooking] = useState<Range>({
    start: '2026-10-16T10:00',
    end: '2026-10-17T22:00',
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <span id="hall-label">Community hall booking</span>
      {/* At most 40 hours: days past the reach are disabled, and a later end is pulled back. */}
      <DateRangePicker
        aria-labelledby="hall-label"
        withTime
        maxHours={40}
        labels={{ start: 'From', end: 'Until' }}
        value={booking}
        onValueChange={setBooking}
      />
      <Text size="sm" color="secondary" aria-live="polite">
        {booking.start && booking.end
          ? `${hoursBetween(booking.start, booking.end)} hours booked`
          : 'Choose both ends'}
      </Text>
    </div>
  );
}
