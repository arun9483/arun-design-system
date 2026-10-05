import { useState } from 'react';
import { DateRangePicker, Text, type DateRangePickerProps } from '@arun-dev/ui';

type Range = NonNullable<DateRangePickerProps['value']>;

export default function DateRangePickerTime() {
  // Each end has its own time. A picked range keeps them; new ends get 00:00 and 23:59.
  const [booking, setBooking] = useState<Range>({
    start: '2026-10-12T14:00',
    end: '2026-10-14T11:00',
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <span id="booking-label">Check-in and check-out</span>
      <DateRangePicker
        aria-labelledby="booking-label"
        withTime
        labels={{ start: 'Check-in', end: 'Check-out' }}
        value={booking}
        onValueChange={setBooking}
      />
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(booking)}
      </Text>
    </div>
  );
}
