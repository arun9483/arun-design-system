import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Calendar, Combobox, Field, OtpInput, RangeSlider } from '@arun-dev/ui';

// Pickers keep their value in React, so they bind with Controller too: field.value to `value`,
// field.onChange to `onValueChange`.
type Values = {
  owner: string | null;
  reviewers: string[];
  hours: readonly [number, number];
  delivery: string | null;
  pin: string;
};

const defaultValues: Values = {
  owner: null,
  reviewers: [],
  hours: [9, 17],
  delivery: null,
  pin: '',
};

const people = ['Ada', 'Grace', 'Katherine', 'Linus', 'Margaret', 'Tim'];

export default function ReactHookFormPickers() {
  const [saved, setSaved] = useState<Values | null>(null);
  const { control, handleSubmit, reset } = useForm<Values>({ defaultValues });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(setSaved)}
      style={{ display: 'grid', gap: 'var(--space-md)', maxInlineSize: '28rem' }}
    >
      {/* One from a long list: the Input is the Field's control, so the label names it. */}
      <Controller
        control={control}
        name="owner"
        rules={{ required: 'Choose an owner.' }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error} required>
            <Field.Label>Owner</Field.Label>
            <Combobox.Root items={people} value={field.value} onValueChange={field.onChange}>
              <Field.Control
                render={<Combobox.Input placeholder="Search people…" />}
                ref={field.ref}
                onBlur={field.onBlur}
              />
              <Combobox.Popup>
                <Combobox.Empty>No one found.</Combobox.Empty>
                <Combobox.List>
                  {(person: string) => (
                    <Combobox.Item key={person} value={person}>
                      {person}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Root>
            <Field.Error>{fieldState.error?.message}</Field.Error>
          </Field.Root>
        )}
      />

      {/* Several from a long list: `multiple`, and the value is an array. */}
      <Controller
        control={control}
        name="reviewers"
        rules={{ validate: (picked) => picked.length <= 3 || 'Up to 3 reviewers.' }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error}>
            <Field.Label>Reviewers</Field.Label>
            <Combobox.Root
              items={people}
              multiple
              value={field.value}
              onValueChange={field.onChange}
            >
              <Field.Control
                render={<Combobox.Input placeholder="Search people…" />}
                ref={field.ref}
                onBlur={field.onBlur}
              />
              <Combobox.Popup>
                <Combobox.Empty>No one found.</Combobox.Empty>
                <Combobox.List>
                  {(person: string) => (
                    <Combobox.Item key={person} value={person}>
                      {person}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Root>
            <Field.Description>Up to 3.</Field.Description>
            <Field.Error>{fieldState.error?.message}</Field.Error>
          </Field.Root>
        )}
      />

      {/* A from–to range: one field holding the pair. RangeSlider and Calendar are groups of
          controls, not one, so the label and error are tied to them by id, with Field's classes. */}
      <Controller
        control={control}
        name="hours"
        rules={{ validate: ([from, to]) => to - from >= 2 || 'At least 2 hours.' }}
        render={({ field, fieldState }) => (
          <div className="field">
            <span id="pickers-hours" className="field-label">
              Working hours{' '}
              <output>
                {field.value[0]}:00 – {field.value[1]}:00
              </output>
            </span>
            <RangeSlider.Root
              aria-labelledby="pickers-hours"
              aria-describedby={fieldState.error ? 'pickers-hours-error' : undefined}
              min={0}
              max={24}
              value={field.value}
              onValueChange={field.onChange}
            >
              <RangeSlider.StartInput aria-label="Start hour" onBlur={field.onBlur} />
              <RangeSlider.EndInput aria-label="End hour" onBlur={field.onBlur} />
            </RangeSlider.Root>
            {fieldState.error && (
              <p id="pickers-hours-error" className="field-error">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* A day picked on a calendar shown in the page: YYYY-MM-DD. */}
      <Controller
        control={control}
        name="delivery"
        rules={{ required: 'Pick a delivery day.' }}
        render={({ field, fieldState }) => (
          <div className="field">
            <span id="pickers-delivery" className="field-label">
              Delivery day
            </span>
            <Calendar
              aria-labelledby="pickers-delivery"
              aria-describedby={fieldState.error ? 'pickers-delivery-error' : undefined}
              value={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.error && (
              <p id="pickers-delivery-error" className="field-error">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* A code: OtpInput, the whole code as one string. */}
      <Controller
        control={control}
        name="pin"
        rules={{ pattern: { value: /^\d{4}$/, message: 'Enter all 4 digits.' } }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error}>
            <Field.Label>Door PIN</Field.Label>
            <Field.Control
              render={
                <OtpInput
                  length={4}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              }
            />
            <Field.Description>Optional.</Field.Description>
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
