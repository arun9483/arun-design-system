import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button, DatePicker, DateRangePicker, Field, Select, Slider, Textarea } from '@arun-dev/ui';

// Controls whose value lives on a native element bind with register(), both ways: the form reads
// what is typed, and setValue() and reset() write to the element.
type Values = {
  title: string;
  notes: string;
  priority: string;
  effort: number;
  due: string;
  from: string;
  to: string;
};

const defaultValues: Values = {
  title: '',
  notes: '',
  priority: '',
  effort: 3,
  due: '',
  from: '',
  to: '',
};

export default function ReactHookFormRegister() {
  const [saved, setSaved] = useState<Values | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ defaultValues });
  const effort = useWatch({ control, name: 'effort' });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(setSaved)}
      style={{ display: 'grid', gap: 'var(--space-md)', maxInlineSize: '28rem' }}
    >
      {/* Input: Field.Control renders one by default. */}
      <Field.Root invalid={!!errors.title} required>
        <Field.Label>Title</Field.Label>
        <Field.Control {...register('title', { required: 'Give the task a title.' })} />
        <Field.Error>{errors.title?.message}</Field.Error>
      </Field.Root>

      <Field.Root invalid={!!errors.notes}>
        <Field.Label>Notes</Field.Label>
        <Field.Control
          render={<Textarea rows={3} autoResize />}
          {...register('notes', { maxLength: { value: 200, message: 'Up to 200 characters.' } })}
        />
        <Field.Error>{errors.notes?.message}</Field.Error>
      </Field.Root>

      {/* An empty first option and a required rule: the empty string counts as missing. */}
      <Field.Root invalid={!!errors.priority} required>
        <Field.Label>Priority</Field.Label>
        <Field.Control
          render={
            <Select>
              <option value="">Choose…</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          }
          {...register('priority', { required: 'Choose a priority.' })}
        />
        <Field.Error>{errors.priority?.message}</Field.Error>
      </Field.Root>

      {/* valueAsNumber: a range input's value is a string until told otherwise. */}
      <Field.Root>
        <Field.Label>
          Effort <output>{effort}</output>
        </Field.Label>
        <Field.Control
          render={<Slider min={1} max={5} />}
          {...register('effort', { valueAsNumber: true })}
        />
      </Field.Root>

      {/* A date is a native date input: YYYY-MM-DD, or '' when empty. */}
      <Field.Root invalid={!!errors.due} required>
        <Field.Label>Due date</Field.Label>
        <Field.Control
          render={<DatePicker />}
          {...register('due', { required: 'Pick a due date.' })}
        />
        <Field.Error>{errors.due?.message}</Field.Error>
      </Field.Root>

      {/* A range is two native inputs, so two fields: one register() for each end. */}
      <Field.Root invalid={!!errors.from || !!errors.to}>
        <Field.Label>Blocked out</Field.Label>
        <Field.Control
          render={
            <DateRangePicker
              startInputProps={register('from', {
                validate: (from, values) => !values.to || !!from || 'Pick a start date too.',
              })}
              endInputProps={register('to')}
            />
          }
        />
        <Field.Description>
          Optional. Leave both empty, or pick a start and an end.
        </Field.Description>
        <Field.Error>{errors.from?.message}</Field.Error>
      </Field.Root>

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
