import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, RadioGroup } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

export default function RadioGroupFieldset() {
  const [submitted, setSubmitted] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-sm)' }}>
      {/* A fieldset through `render`, so the legend names the group natively. `required`
          is the platform's: submit is blocked until something is chosen. */}
      <RadioGroup.Root
        render={<fieldset />}
        name="delivery"
        required
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <legend className="text-size-sm text-color-secondary">Delivery</legend>
        <label style={row}>
          <RadioGroup.Item value="standard" />
          Standard
        </label>
        <label style={row}>
          <RadioGroup.Item value="express" />
          Express
        </label>
      </RadioGroup.Root>

      <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
        <Button type="submit" variant="primary">
          Submit
        </Button>
        {/* form.reset() returns the group to the value it mounted with — here, none. */}
        <Button type="reset" onClick={() => setSubmitted('')}>
          Reset
        </Button>
      </div>

      <code className="text-size-sm">{submitted || 'FormData will appear here'}</code>
    </form>
  );
}
