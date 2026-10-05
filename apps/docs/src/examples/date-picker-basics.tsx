import { useState } from 'react';
import { DatePicker, Field, Text } from '@arun-dev/ui';

export default function DatePickerBasics() {
  // An ISO date, `YYYY-MM-DD`, or null — exactly what a native date input holds.
  const [due, setDue] = useState<string | null>('2026-10-16');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <Field.Root>
        <Field.Label>Due date</Field.Label>
        <Field.Control render={<DatePicker value={due} onValueChange={setDue} />} />
        <Field.Description>Type it, or pick it from the calendar.</Field.Description>
      </Field.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(due)}
      </Text>
    </div>
  );
}
