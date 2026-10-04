import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Checkbox,
  Combobox,
  Field,
  OtpInput,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Textarea,
} from '@arun-dev/ui';

type Values = {
  name: string;
  email: string;
  bio: string;
  country: string;
  city: string | null;
  plan: string | null;
  interests: string[];
  seats: number;
  updates: boolean;
  code: string;
  terms: boolean;
};

const defaultValues: Values = {
  name: '',
  email: '',
  bio: '',
  country: '',
  city: null,
  plan: null,
  interests: [],
  seats: 2,
  updates: true,
  code: '',
  terms: false,
};

const cities = ['Bengaluru', 'Berlin', 'Lagos', 'London', 'New York', 'São Paulo', 'Tokyo'];
const interests = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
];

const stack = { display: 'grid', gap: 'var(--space-md)', maxInlineSize: '28rem' };
const group = { display: 'grid', gap: 'var(--space-2xs)', border: 0, padding: 0, margin: 0 };
const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };
// A group's legend and error read like a Field's label and error: the same tokens.
const legend = {
  padding: 0,
  fontSize: 'var(--field-label-font-size)',
  fontWeight: 'var(--field-label-font-weight)',
  color: 'var(--field-label-color)',
};
const error = {
  margin: 0,
  fontSize: 'var(--field-message-font-size)',
  color: 'var(--field-error-color)',
};

/** Stands in for your server: only 123456 is the code it sent. */
async function checkCode(code: string) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return code === '123456';
}

export default function ReactHookFormSignup() {
  const [submitted, setSubmitted] = useState<Values | null>(null);
  // The default modes: errors appear on submit, then update as you type. Validating on blur as
  // well would move the button under a pointer whose press blurred the field above it.
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues });

  const plan = watch('plan');
  const seats = watch('seats');

  async function onSubmit(values: Values) {
    setSubmitted(null);
    // A rule only the server can check, reported back onto its field.
    if (!(await checkCode(values.code))) {
      setError('code', { message: 'That code is not right. Try 123456.' }, { shouldFocus: true });
      return;
    }
    setSubmitted(values);
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} style={stack}>
      {/* Input, Textarea, Select and Slider keep their value on the element: register(). */}
      <Field.Root invalid={!!errors.name} required>
        <Field.Label>Full name</Field.Label>
        <Field.Control
          autoComplete="name"
          {...register('name', {
            required: 'Enter your name.',
            minLength: { value: 2, message: 'Use at least 2 characters.' },
          })}
        />
        <Field.Error>{errors.name?.message}</Field.Error>
      </Field.Root>

      <Field.Root invalid={!!errors.email} required>
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Enter your email.',
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: 'Enter an email like ada@example.com.',
            },
          })}
        />
        <Field.Description>We send the receipt here.</Field.Description>
        <Field.Error>{errors.email?.message}</Field.Error>
      </Field.Root>

      <Field.Root invalid={!!errors.bio}>
        <Field.Label>About you</Field.Label>
        <Field.Control
          render={<Textarea rows={3} />}
          {...register('bio', {
            maxLength: { value: 160, message: 'Keep it under 160 characters.' },
          })}
        />
        <Field.Description>Optional. Up to 160 characters.</Field.Description>
        <Field.Error>{errors.bio?.message}</Field.Error>
      </Field.Root>

      <Field.Root invalid={!!errors.country} required>
        <Field.Label>Country</Field.Label>
        <Field.Control
          render={
            <Select>
              <option value="">Choose…</option>
              <option value="in">India</option>
              <option value="de">Germany</option>
              <option value="ng">Nigeria</option>
              <option value="gb">United Kingdom</option>
              <option value="us">United States</option>
            </Select>
          }
          {...register('country', { required: 'Choose a country.' })}
        />
        <Field.Error>{errors.country?.message}</Field.Error>
      </Field.Root>

      {/* Combobox, RadioGroup, Checkbox, Switch and OtpInput keep their value in React:
          Controller. */}
      <Controller
        control={control}
        name="city"
        rules={{ required: 'Choose a city from the list.' }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error} required>
            <Field.Label>City</Field.Label>
            <Combobox.Root items={cities} value={field.value} onValueChange={field.onChange}>
              <Field.Control
                render={<Combobox.Input placeholder="Search cities…" />}
                ref={field.ref}
                onBlur={field.onBlur}
              />
              <Combobox.Popup>
                <Combobox.Empty>No cities found.</Combobox.Empty>
                <Combobox.List>
                  {(city: string) => (
                    <Combobox.Item key={city} value={city}>
                      {city}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Root>
            <Field.Error>{fieldState.error?.message}</Field.Error>
          </Field.Root>
        )}
      />

      {/* A group of controls is a fieldset with a legend, not a Field: one Field names one
          control. The error is tied to the group with aria-describedby. */}
      <Controller
        control={control}
        name="plan"
        // deps: changing the plan re-checks seats, whose rule reads it.
        rules={{ required: 'Choose a plan.', deps: ['seats'] }}
        render={({ field, fieldState }) => (
          <RadioGroup.Root
            render={<fieldset />}
            style={group}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={fieldState.error ? 'signup-plan-error' : undefined}
          >
            <legend style={legend}>Plan</legend>
            {['Free', 'Pro', 'Team'].map((label) => (
              <label key={label} style={row}>
                <RadioGroup.Item value={label.toLowerCase()} />
                {label}
              </label>
            ))}
            {fieldState.error && (
              <p id="signup-plan-error" style={error}>
                {fieldState.error.message}
              </p>
            )}
          </RadioGroup.Root>
        )}
      />

      <Controller
        control={control}
        name="interests"
        rules={{ validate: (picked) => picked.length > 0 || 'Pick at least one.' }}
        render={({ field, fieldState }) => (
          <fieldset
            style={group}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={fieldState.error ? 'signup-interests-error' : undefined}
          >
            <legend style={legend}>Interests</legend>
            {interests.map(({ value, label }) => (
              <label key={value} htmlFor={`signup-interest-${value}`} style={row}>
                {/* One array value, shared by the group: each box adds or removes itself. */}
                <Checkbox.Root
                  id={`signup-interest-${value}`}
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
              <p id="signup-interests-error" style={error}>
                {fieldState.error.message}
              </p>
            )}
          </fieldset>
        )}
      />

      <Field.Root invalid={!!errors.seats}>
        <Field.Label>
          Seats <output>{seats}</output>
        </Field.Label>
        <Field.Control
          render={<Slider min={1} max={10} />}
          {...register('seats', {
            valueAsNumber: true,
            // Rules can read other fields: the free plan stops at 3 seats.
            validate: (value, values) =>
              values.plan !== 'free' || value <= 3 || 'The free plan has up to 3 seats.',
          })}
        />
        <Field.Description>
          {plan === 'free' ? 'The free plan has up to 3 seats.' : 'From 1 to 10.'}
        </Field.Description>
        <Field.Error>{errors.seats?.message}</Field.Error>
      </Field.Root>

      <Controller
        control={control}
        name="updates"
        render={({ field }) => (
          <label htmlFor="signup-updates" style={row}>
            <Switch.Root
              id="signup-updates"
              ref={field.ref}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            >
              <Switch.Thumb />
            </Switch.Root>
            Email me product updates
          </label>
        )}
      />

      <Controller
        control={control}
        name="code"
        rules={{
          pattern: { value: /^\d{6}$/, message: 'Enter all 6 digits.' },
          required: 'Enter the code.',
        }}
        render={({ field, fieldState }) => (
          <Field.Root invalid={!!fieldState.error} required>
            <Field.Label>Verification code</Field.Label>
            <Field.Control
              render={
                <OtpInput
                  length={6}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              }
            />
            <Field.Description>
              We sent it to your email. The right one here is 123456.
            </Field.Description>
            <Field.Error>{fieldState.error?.message}</Field.Error>
          </Field.Root>
        )}
      />

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
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Checking…' : 'Create account'}
        </Button>
        <Button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(null);
          }}
        >
          Reset
        </Button>
      </div>

      <output aria-live="polite">
        {submitted && <pre className="text-size-sm">{JSON.stringify(submitted, null, 2)}</pre>}
      </output>
    </form>
  );
}
