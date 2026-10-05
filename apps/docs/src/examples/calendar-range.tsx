import { useState } from 'react';
import { RangeCalendar, Text, type RangeCalendarProps } from '@arun-dev/ui';

type Range = NonNullable<RangeCalendarProps['value']>;

export default function CalendarRange() {
  const [range, setRange] = useState<Range | null>(null);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <RangeCalendar
        aria-label="Leave"
        value={range}
        onValueChange={setRange}
        maxDays={5}
        months={2}
        min="2026-10-01"
      />
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(range)}
      </Text>
    </div>
  );
}
