import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, Field, RadioGroup, Switch } from '@arun-dev/ui';

// Controls whose value lives in React bind with Controller: value and onChange (or the
// control's own names for them) from `field`, and the error from `fieldState`.
type Values = {
  visibility: string | null;
  channels: string[];
  reminders: boolean;
  terms: boolean;
};

const defaultValues: Values = { visibility: null, channels: [], reminders: true, terms: false };

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
];

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

export default function ReactHookFormChoices() {
  const [saved, setSaved] = useState<Values | null>(null);
  const { control, handleSubmit, reset } = useForm<Values>({ defaultValues });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(setSaved)}
      style={{ display: 'grid', gap: 'var(--space-md)', maxInlineSize: '28rem' }}
    >
      {/* One of a few: a RadioGroup rendered as the fieldset, so its legend names the group. */}
      <Controller
        control={control}
        name="visibility"
        rules={{ required: 'Choose who can see it.' }}
        render={({ field, fieldState }) => (
          <RadioGroup.Root
            render={<fieldset />}
            className="fieldset"
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            aria-describedby={fieldState.error ? 'choices-visibility-error' : undefined}
          >
            <legend className="fieldset-legend">Visibility</legend>
            {['Private', 'Team', 'Public'].map((label) => (
              <label key={label} style={row}>
                <RadioGroup.Item value={label.toLowerCase()} />
                {label}
              </label>
            ))}
            {fieldState.error && (
              <p id="choices-visibility-error" className="fieldset-error">
                {fieldState.error.message}
              </p>
            )}
          </RadioGroup.Root>
        )}
      />

      {/* Several of a few: one array field, each Checkbox adding or removing its own value. */}
      <Controller
        control={control}
        name="channels"
        rules={{ validate: (picked) => picked.length > 0 || 'Pick at least one channel.' }}
        render={({ field, fieldState }) => (
          <fieldset
            className="fieldset"
            aria-describedby={fieldState.error ? 'choices-channels-error' : undefined}
          >
            <legend className="fieldset-legend">Notify me by</legend>
            {channels.map(({ value, label }) => (
              <label key={value} htmlFor={`choices-channel-${value}`} style={row}>
                <Checkbox.Root
                  id={`choices-channel-${value}`}
                  checked={field.value.includes(value)}
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked === true
                        ? [...field.value, value]
                        : field.value.filter((picked) => picked !== value),
                    )
                  }
                  onBlur={field.onBlur}
                >
                  <Checkbox.Indicator />
                </Checkbox.Root>
                {label}
              </label>
            ))}
            {fieldState.error && (
              <p id="choices-channels-error" className="fieldset-error">
                {fieldState.error.message}
              </p>
            )}
          </fieldset>
        )}
      />

      {/* On or off, taking effect as a setting: a Switch. */}
      <Controller
        control={control}
        name="reminders"
        render={({ field }) => (
          <label htmlFor="choices-reminders" style={row}>
            <Switch.Root
              id="choices-reminders"
              ref={field.ref}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            >
              <Switch.Thumb />
            </Switch.Root>
            Send reminders
          </label>
        )}
      />

      {/* Must be ticked: validate, not required, and the third state resolved to a boolean. */}
      <Controller
        control={control}
        name="terms"
        rules={{ validate: (accepted) => accepted || 'Accept the terms to continue.' }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error}>
            <div style={row}>
              <Field.Control
                render={
                  <Checkbox.Root
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Root>
                }
              />
              <Field.Label>I accept the terms</Field.Label>
            </div>
            <Field.Error>{fieldState.error?.message}</Field.Error>
          </Field.Root>
        )}
      />

      <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
        <Button type="submit" variant="primary">
          Save
        </Button>
        <Button
          type="button"
          onClick={() => {
            reset();
            setSaved(null);
          }}
        >
          Reset
        </Button>
      </div>
      <output aria-live="polite">
        {saved && <pre className="text-size-sm">{JSON.stringify(saved, null, 2)}</pre>}
      </output>
    </form>
  );
}
