import { useState } from 'react';
import { DatePicker, Field, Text } from '@arun-dev/ui';

// From an API: a UTC instant, with Z. The picker shows it in the user's time zone.
const FROM_SERVER = '2026-10-16T08:00:00Z';

export default function DatePickerIso() {
  const [value, setValue] = useState<string | null>(FROM_SERVER);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <Field.Root>
        <Field.Label>Publish at</Field.Label>
        <Field.Control render={<DatePicker withTime value={value} onValueChange={setValue} />} />
      </Field.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        {/* Back to an instant for the server: a local date-time parses as local time. */}
        value: {JSON.stringify(value)} → {value ? new Date(value).toISOString() : 'null'}
      </Text>
    </div>
  );
}
