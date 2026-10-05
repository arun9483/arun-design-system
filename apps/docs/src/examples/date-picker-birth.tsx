import { useState } from 'react';
import { DatePicker, Field, Text } from '@arun-dev/ui';

// No birthdays in the future: max is today, so the year list ends at this year.
const today = new Date().toISOString().slice(0, 10);

export default function DatePickerBirth() {
  const [born, setBorn] = useState<string | null>('1990-06-15T07:30');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <Field.Root>
        <Field.Label>Date and time of birth</Field.Label>
        {/* Month and year selects jump decades in one move; the time is set under the calendar. */}
        <Field.Control
          render={
            <DatePicker
              withTime
              captionLayout="dropdown"
              min="1900-01-01"
              max={today}
              value={born}
              onValueChange={setBorn}
            />
          }
        />
      </Field.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(born)}
      </Text>
    </div>
  );
}
