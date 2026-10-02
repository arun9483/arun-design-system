import { useState } from 'react';
import { Field, Select } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-md)', maxInlineSize: '20rem' };

export default function FieldBasics() {
  const [email, setEmail] = useState('ada@');
  // Field validates nothing: invalid is yours — here, a simple check as you type.
  const invalid = email !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <div style={stack}>
      <Field.Root invalid={invalid} required>
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <Field.Description>We send the receipt here.</Field.Description>
        <Field.Error>Enter an email like ada@example.com.</Field.Error>
      </Field.Root>

      {/* Any control, through render. */}
      <Field.Root>
        <Field.Label>Plan</Field.Label>
        <Field.Control
          render={
            <Select defaultValue="pro">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </Select>
          }
        />
        <Field.Description>Change it any time.</Field.Description>
      </Field.Root>

      <Field.Root disabled>
        <Field.Label>Company</Field.Label>
        <Field.Control defaultValue="Analytical Engines Ltd" />
      </Field.Root>
    </div>
  );
}
