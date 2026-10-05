import { useState } from 'react';
import { Calendar, Text } from '@arun-dev/ui';

/** Saturdays and Sundays. A date is an ISO string; its weekday comes from a UTC Date. */
const isWeekend = (date: string) => [0, 6].includes(new Date(date).getUTCDay());

export default function CalendarBasics() {
  const [date, setDate] = useState<string | null>('2026-10-14');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <Calendar
        aria-label="Delivery day"
        value={date}
        onValueChange={setDate}
        min="2026-10-07"
        max="2026-11-30"
        isDateUnavailable={isWeekend}
      />
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(date)}
      </Text>
    </div>
  );
}
