import { useState } from 'react';
import { DateRangePicker, Text, type DateRangePickerProps } from '@arun-dev/ui';

type Range = NonNullable<DateRangePickerProps['value']>;

export default function DateRangePickerBasics() {
  const [trip, setTrip] = useState<Range>({ start: '2026-10-12', end: '2026-10-16' });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <span id="trip-label">Trip dates</span>
      {/* Up to 14 days, both ends counted. Two months side by side, wrapping on a phone. */}
      <DateRangePicker
        aria-labelledby="trip-label"
        value={trip}
        onValueChange={setTrip}
        maxDays={14}
        months={2}
      />
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(trip)}
      </Text>
    </div>
  );
}
