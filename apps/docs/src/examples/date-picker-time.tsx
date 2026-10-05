import { useState } from 'react';
import { DatePicker, Field, Text } from '@arun-dev/ui';

export default function DatePickerTime() {
  // With withTime, `YYYY-MM-DDTHH:mm`, in the user's local time. Picking a day keeps the time.
  const [start, setStart] = useState<string | null>('2026-10-16T09:30');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <Field.Root>
        <Field.Label>Meeting starts</Field.Label>
        <Field.Control render={<DatePicker withTime value={start} onValueChange={setStart} />} />
      </Field.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        value: {JSON.stringify(start)}
      </Text>
    </div>
  );
}
