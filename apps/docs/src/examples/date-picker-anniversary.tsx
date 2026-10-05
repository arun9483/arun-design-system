import { useState } from 'react';
import { DatePicker, Field, Text } from '@arun-dev/ui';

const today = new Date().toISOString().slice(0, 10);

/** The next time the day comes round, on or after today, and the years it will mark. */
function nextAnniversary(wedding: string) {
  const [y, m, d] = wedding.split('-');
  const thisYear = Number(today.slice(0, 4));
  const candidate = `${thisYear}-${m}-${d}`;
  const year = candidate >= today ? thisYear : thisYear + 1;
  return { date: `${year}-${m}-${d}`, years: year - Number(y) };
}

export default function DatePickerAnniversary() {
  const [wedding, setWedding] = useState<string | null>('2001-02-14');
  const next = wedding ? nextAnniversary(wedding) : null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <Field.Root>
        <Field.Label>Wedding date</Field.Label>
        {/* In the past, perhaps decades: the selects reach it, and max stops a future date. */}
        <Field.Control
          render={
            <DatePicker
              captionLayout="dropdown"
              max={today}
              value={wedding}
              onValueChange={setWedding}
            />
          }
        />
      </Field.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        {next
          ? `Next anniversary: ${next.date}, ${next.years} ${next.years === 1 ? 'year' : 'years'}`
          : 'No date yet'}
      </Text>
    </div>
  );
}
