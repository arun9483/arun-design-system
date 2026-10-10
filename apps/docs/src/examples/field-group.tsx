import { useState } from 'react';
import { Button, Checkbox } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };
const options = ['Email', 'SMS', 'Push'];

// A group of controls under one caption: a native <fieldset> and <legend>, drawn as a Field is.
// The error is tied to the group with aria-describedby, and shown only while it applies.
export default function FieldGroup() {
  const [picked, setPicked] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const invalid = tried && picked.length === 0;
  return (
    <form
      style={{ display: 'grid', gap: 'var(--space-sm)', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
      }}
    >
      <fieldset
        className="fieldset"
        aria-describedby={invalid ? 'field-group-hint field-group-error' : 'field-group-hint'}
      >
        <legend className="fieldset-legend">Notify me by</legend>
        <p id="field-group-hint" className="fieldset-description">
          Pick one or more.
        </p>
        {options.map((option) => (
          <label key={option} htmlFor={`field-group-${option}`} style={row}>
            <Checkbox.Root
              id={`field-group-${option}`}
              checked={picked.includes(option)}
              onCheckedChange={(checked) =>
                setPicked((list) =>
                  checked === true ? [...list, option] : list.filter((o) => o !== option),
                )
              }
            >
              <Checkbox.Indicator />
            </Checkbox.Root>
            {option}
          </label>
        ))}
        {invalid && (
          <p id="field-group-error" className="fieldset-error">
            Choose at least one.
          </p>
        )}
      </fieldset>
      <Button type="submit" variant="primary">
        Save
      </Button>
    </form>
  );
}
