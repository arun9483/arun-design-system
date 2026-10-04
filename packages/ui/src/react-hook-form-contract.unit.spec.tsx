import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm, Controller, useController, useWatch } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import { Button } from './components/button';
import { Checkbox } from './components/checkbox';
import { Input } from './components/input';
import { OtpInput } from './components/otp-input';
import { RadioGroup } from './components/radio-group';
import { Select } from './components/select';
import { Switch } from './components/switch';
import { Textarea } from './components/textarea';

/**
 * Contract: every control that carries a value works with react-hook-form's
 * `Controller` API, and keeps working.
 *
 * Checkbox and Switch are not native inputs — a `<button>` holds the state and a hidden
 * `<input>` carries the form value. RadioGroup is, but its value lives in React. Either
 * way nothing about that compatibility is guaranteed by construction. It rests on details
 * that are easy to change without noticing: that the change callback fires in both
 * controlled and uncontrolled modes, that a controlled component does not move unless
 * its parent moves it, and that a native `form.reset()` reports through the same
 * callback rather than silently.
 *
 * Break any of those and the component still renders, still passes its own unit tests,
 * and silently submits a value the user never chose. This is the third contract spec,
 * for the same reason as the other two: the seam is invisible from inside one package.
 *
 * `register()` is deliberately not covered. It cannot work here and cannot be made to
 * — see the "does not fit" case at the end, which pins that as known behaviour rather
 * than leaving it to be rediscovered.
 */

/** A field object of the shape `Controller` hands its render prop. */
type Field = Pick<ControllerRenderProps, 'value' | 'onChange' | 'onBlur'>;

/**
 * The value-carrying controls, driven through one battery of tests. Adding a control
 * here is how a new one proves it belongs in a form.
 */
const CONTROLS = [
  {
    label: 'Checkbox',
    role: 'checkbox',
    render: (field: Field, extra: Record<string, unknown> = {}) => (
      <Checkbox.Root
        checked={field.value}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        aria-label="field"
        {...extra}
      >
        <Checkbox.Indicator />
      </Checkbox.Root>
    ),
  },
  {
    label: 'Switch',
    role: 'switch',
    render: (field: Field, extra: Record<string, unknown> = {}) => (
      <Switch.Root
        checked={field.value}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        aria-label="field"
        {...extra}
      >
        <Switch.Thumb />
      </Switch.Root>
    ),
  },
] as const;

describe.each(CONTROLS)('$label with react-hook-form', (control) => {
  it('binds both ways and submits what the user chose', async () => {
    const onSubmit = vi.fn();

    function Form() {
      const { control: formControl, handleSubmit } = useForm({ defaultValues: { v: false } });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={formControl}
            name="v"
            render={({ field }) => control.render(field)}
          />
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByRole(control.role));
    await act(async () => fireEvent.click(screen.getByText('Save')));

    expect(onSubmit).toHaveBeenCalledWith({ v: true }, expect.anything());
  });

  it('reaches useWatch, so other fields can react to it', () => {
    const seen: unknown[] = [];

    function Watcher({ control: formControl }: { control: never }) {
      seen.push(useWatch({ control: formControl, name: 'v' }));
      return null;
    }

    function Form() {
      const { control: formControl } = useForm({ defaultValues: { v: false } });
      return (
        <>
          <Controller
            control={formControl}
            name="v"
            render={({ field }) => control.render(field)}
          />
          <Watcher control={formControl as never} />
        </>
      );
    }

    render(<Form />);
    expect(seen.at(-1)).toBe(false);
    fireEvent.click(screen.getByRole(control.role));
    expect(seen.at(-1)).toBe(true);
  });

  it('works through useController as well as Controller', () => {
    function Form() {
      const { control: formControl } = useForm({ defaultValues: { v: false } });
      const { field } = useController({ control: formControl, name: 'v' });
      return (
        <>
          {control.render(field)}
          <span data-testid="value">{String(field.value)}</span>
        </>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByRole(control.role));
    expect(screen.getByTestId('value')).toHaveTextContent('true');
  });

  it('follows setValue and reset — the form can drive it, not just read it', () => {
    let setValue: (name: 'v', value: boolean) => void;
    let reset: () => void;

    function Form() {
      const {
        control: formControl,
        setValue: s,
        reset: r,
      } = useForm({
        defaultValues: { v: false },
      });
      setValue = s;
      reset = r;
      return (
        <Controller control={formControl} name="v" render={({ field }) => control.render(field)} />
      );
    }

    render(<Form />);
    act(() => setValue('v', true));
    expect(screen.getByRole(control.role)).toHaveAttribute('aria-checked', 'true');

    act(() => reset());
    expect(screen.getByRole(control.role)).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps the form in step through a native form reset', async () => {
    const seen: unknown[] = [];

    function Watcher({ control: formControl }: { control: never }) {
      seen.push(useWatch({ control: formControl, name: 'v' }));
      return null;
    }

    function Form() {
      const { control: formControl } = useForm({ defaultValues: { v: false } });
      return (
        <form>
          <Controller
            control={formControl}
            name="v"
            render={({ field }) => control.render(field)}
          />
          <Watcher control={formControl as never} />
          <Button type="reset">Reset</Button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByRole(control.role));
    expect(seen.at(-1)).toBe(true);

    // The platform resets the hidden input; useFormReset reports the change through
    // onCheckedChange, which is the only reason react-hook-form hears about it at all.
    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
      // The control settles a reset a task later, after any re-render it caused.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByRole(control.role)).toHaveAttribute('aria-checked', 'false');
    expect(seen.at(-1)).toBe(false);
  });

  it('participates in validation', async () => {
    const onSubmit = vi.fn();
    let message: string | undefined;

    function Form() {
      const {
        control: formControl,
        handleSubmit,
        formState,
      } = useForm({
        defaultValues: { v: false },
      });
      message = formState.errors.v?.message;
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={formControl}
            name="v"
            rules={{ required: 'Required' }}
            render={({ field }) => control.render(field)}
          />
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    // `false` is absent as far as `required` is concerned, so this must not submit.
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(message).toBe('Required');

    fireEvent.click(screen.getByRole(control.role));
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('marks the form dirty when the user moves it', async () => {
    let isDirty = true;

    function Form() {
      const { control: formControl, formState } = useForm({
        defaultValues: { v: false },
        mode: 'onChange',
      });
      isDirty = formState.isDirty;
      return (
        <Controller control={formControl} name="v" render={({ field }) => control.render(field)} />
      );
    }

    render(<Form />);
    expect(isDirty).toBe(false);
    await act(async () => fireEvent.click(screen.getByRole(control.role)));
    expect(isDirty).toBe(true);
  });

  it('does not move the form value when disabled', () => {
    const seen: unknown[] = [];

    function Watcher({ control: formControl }: { control: never }) {
      seen.push(useWatch({ control: formControl, name: 'v' }));
      return null;
    }

    function Form() {
      const { control: formControl } = useForm({ defaultValues: { v: false } });
      return (
        <>
          <Controller
            control={formControl}
            name="v"
            render={({ field }) => control.render(field, { disabled: true })}
          />
          <Watcher control={formControl as never} />
        </>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByRole(control.role));
    expect(seen.at(-1)).toBe(false);
  });

  it('does not fit register(), and fails quietly when forced — known, not accepted', async () => {
    const onSubmit = vi.fn();

    function Form() {
      const { register, handleSubmit } = useForm({ defaultValues: { v: false } });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          {control.render({ value: false, onChange: () => {}, onBlur: () => {} }, register('v'))}
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(screen.getByRole(control.role));
    await act(async () => fireEvent.click(screen.getByText('Save')));

    // `register` hands back a `ref` for a native input and an `onChange` for a `change`
    // event. The ref lands on the <button>, which has no `.checked`, and a <button>
    // never fires `change` — so the form keeps its default while the control shows
    // otherwise. Pinned here so the docs' advice to use Controller stays true.
    expect(onSubmit).toHaveBeenCalledWith({ v: false }, expect.anything());
  });
});

/**
 * RadioGroup is the one value-carrying control built on the native element — each item
 * is a real `<input type="radio">` — so it does not share the battery above: its value is
 * a string, not a boolean, and it has no `aria-checked` to assert on.
 *
 * Being native does not buy `register()`, though. The group owns the value in React and
 * every radio's `checked` derives from it (decision 10), while `register` expects inputs
 * whose DOM is the value. Its reads work; its writes land on the DOM behind React's back.
 * `Controller` is the answer here too — see the last case.
 */
describe('RadioGroup with react-hook-form', () => {
  type PlanField = Pick<ControllerRenderProps, 'value' | 'onChange' | 'onBlur' | 'name'>;

  function Plan({ field, ...extra }: { field: PlanField } & Record<string, unknown>) {
    return (
      <RadioGroup.Root
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
        aria-label="Plan"
        {...extra}
      >
        <RadioGroup.Item value="free" aria-label="free" />
        <RadioGroup.Item value="pro" aria-label="pro" />
      </RadioGroup.Root>
    );
  }

  const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name });

  it('binds both ways and submits what the user chose', async () => {
    const onSubmit = vi.fn();

    function Form() {
      const { control, handleSubmit } = useForm({ defaultValues: { plan: 'free' } });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="plan"
            render={({ field }) => <Plan field={field} />}
          />
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    expect(radio('free')).toBeChecked();
    fireEvent.click(radio('pro'));
    await act(async () => fireEvent.click(screen.getByText('Save')));

    expect(onSubmit).toHaveBeenCalledWith({ plan: 'pro' }, expect.anything());
  });

  it('works through useController, and marks the form dirty', async () => {
    let isDirty = true;

    function Form() {
      const { control, formState } = useForm({
        defaultValues: { plan: 'free' },
        mode: 'onChange',
      });
      const { field } = useController({ control, name: 'plan' });
      isDirty = formState.isDirty;
      return (
        <>
          <Plan field={field} />
          <span data-testid="value">{field.value}</span>
        </>
      );
    }

    render(<Form />);
    expect(isDirty).toBe(false);
    await act(async () => fireEvent.click(radio('pro')));
    expect(screen.getByTestId('value')).toHaveTextContent('pro');
    expect(isDirty).toBe(true);
  });

  it('follows setValue and reset — the form can drive it, not just read it', () => {
    let setValue: (name: 'plan', value: string) => void;
    let reset: () => void;

    function Form() {
      const form = useForm({ defaultValues: { plan: 'free' } });
      setValue = form.setValue;
      reset = form.reset;
      return (
        <Controller
          control={form.control}
          name="plan"
          render={({ field }) => <Plan field={field} />}
        />
      );
    }

    render(<Form />);
    act(() => setValue('plan', 'pro'));
    expect(radio('pro')).toBeChecked();
    expect(radio('pro')).toHaveAttribute('data-checked');

    act(() => reset());
    expect(radio('free')).toBeChecked();
    expect(radio('pro')).toHaveAttribute('data-unchecked');
  });

  it('keeps the form in step through a native form reset', async () => {
    const seen: unknown[] = [];

    function Watcher({ control }: { control: never }) {
      seen.push(useWatch({ control, name: 'plan' }));
      return null;
    }

    function Form() {
      const { control } = useForm({ defaultValues: { plan: 'free' } });
      return (
        <form>
          <Controller
            control={control}
            name="plan"
            render={({ field }) => <Plan field={field} />}
          />
          <Watcher control={control as never} />
          <Button type="reset">Reset</Button>
        </form>
      );
    }

    render(<Form />);
    fireEvent.click(radio('pro'));
    expect(seen.at(-1)).toBe('pro');

    // The platform resets the inputs; the group reports the change through
    // onValueChange, which is the only reason react-hook-form hears about it at all.
    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
      // The control settles a reset a task later, after any re-render it caused.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(radio('free')).toBeChecked();
    expect(seen.at(-1)).toBe('free');
  });

  it('participates in validation', async () => {
    const onSubmit = vi.fn();
    let message: string | undefined;

    function Form() {
      const { control, handleSubmit, formState } = useForm<{ plan: string | null }>({
        defaultValues: { plan: null },
      });
      message = formState.errors.plan?.message;
      return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            control={control}
            name="plan"
            rules={{ required: 'Required' }}
            render={({ field }) => <Plan field={field} />}
          />
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(message).toBe('Required');

    fireEvent.click(radio('free'));
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not move the form value when disabled', () => {
    let value: unknown;

    function Form() {
      const { control, watch } = useForm({ defaultValues: { plan: 'free' } });
      value = watch('plan');
      return (
        <Controller
          control={control}
          name="plan"
          render={({ field }) => <Plan field={field} disabled />}
        />
      );
    }

    render(<Form />);
    fireEvent.click(radio('pro'));
    expect(value).toBe('free');
  });

  it('reads through register(), but cannot be driven by it — known, not accepted', () => {
    const api: { form?: ReturnType<typeof useForm<{ plan: string | null }>> } = {};

    function Form() {
      const form = useForm<{ plan: string | null }>({ defaultValues: { plan: 'free' } });
      api.form = form;
      const { name, ...field } = form.register('plan');
      return (
        <RadioGroup.Root name={name} defaultValue="free" aria-label="Plan">
          <RadioGroup.Item value="free" aria-label="free" {...field} />
          <RadioGroup.Item value="pro" aria-label="pro" {...field} />
        </RadioGroup.Root>
      );
    }

    render(<Form />);

    // The read half works: the inputs are native, and register reads them.
    fireEvent.click(radio('pro'));
    expect(api.form?.getValues('plan')).toBe('pro');

    // The write half does not. setValue sets `.checked` on the DOM directly; the group's
    // value — and everything derived from it — never hears of it. The screen and the
    // state attributes now disagree, which is the failure Controller avoids.
    act(() => api.form?.setValue('plan', 'free'));
    expect(radio('free')).toBeChecked();
    expect(radio('free')).toHaveAttribute('data-unchecked');
    expect(radio('pro')).toHaveAttribute('data-checked');
  });
});
describe('Button with react-hook-form', () => {
  it('submits only when asked to', async () => {
    const onSubmit = vi.fn();

    function Form() {
      const { handleSubmit } = useForm({ defaultValues: {} });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Button>Cancel</Button>
          <Button type="submit">Save</Button>
        </form>
      );
    }

    render(<Form />);
    // The default is type="button", so a button in a form is inert until told otherwise.
    await act(async () => fireEvent.click(screen.getByText('Cancel')));
    expect(onSubmit).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe('Input with react-hook-form', () => {
  // Input is a native <input> and keeps no state of its own, so register() — not
  // Controller — is the binding. The box around it must not get in the way: ref, name,
  // onChange and onBlur all have to reach the <input>, with or without slots.
  type Values = { email: string };

  function setup() {
    const api: { form?: ReturnType<typeof useForm<Values>> } = {};
    const onSubmit = vi.fn();

    function Form() {
      const form = useForm<Values>({ defaultValues: { email: 'ada@example.com' } });
      api.form = form;
      const error = form.formState.errors.email;
      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            aria-label="Email"
            aria-invalid={error ? true : undefined}
            startSlot="@"
            {...form.register('email', { required: true })}
          />
          <button type="submit">Save</button>
        </form>
      );
    }

    render(<Form />);
    return { api, onSubmit, input: screen.getByRole<HTMLInputElement>('textbox') };
  }

  it('shows defaultValues and reads what the user types', () => {
    const { api, input } = setup();
    expect(input.value).toBe('ada@example.com');
    fireEvent.change(input, { target: { value: 'grace@example.com' } });
    expect(api.form?.getValues('email')).toBe('grace@example.com');
  });

  it('is driven by setValue and reset', () => {
    const { api, input } = setup();
    act(() => api.form?.setValue('email', 'grace@example.com'));
    expect(input.value).toBe('grace@example.com');
    act(() => api.form?.reset());
    expect(input.value).toBe('ada@example.com');
  });

  it('blocks submit on a failed rule, and aria-invalid reaches the input', async () => {
    const { onSubmit, input } = setup();
    fireEvent.change(input, { target: { value: '' } });
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Textarea with react-hook-form', () => {
  // Textarea is a native <textarea> with no state of its own, so register() is the
  // binding, exactly as for Input.
  type Values = { bio: string };

  function setup() {
    const api: { form?: ReturnType<typeof useForm<Values>> } = {};
    const onSubmit = vi.fn();

    function Form() {
      const form = useForm<Values>({ defaultValues: { bio: 'First line\nSecond line' } });
      api.form = form;
      const error = form.formState.errors.bio;
      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Textarea
            aria-label="Bio"
            aria-invalid={error ? true : undefined}
            autoResize
            {...form.register('bio', { required: true })}
          />
          <button type="submit">Save</button>
        </form>
      );
    }

    render(<Form />);
    return { api, onSubmit, textarea: screen.getByRole<HTMLTextAreaElement>('textbox') };
  }

  it('shows defaultValues, newlines included, and reads what the user types', () => {
    const { api, textarea } = setup();
    expect(textarea.value).toBe('First line\nSecond line');
    fireEvent.change(textarea, { target: { value: 'Rewritten' } });
    expect(api.form?.getValues('bio')).toBe('Rewritten');
  });

  it('is driven by setValue and reset', () => {
    const { api, textarea } = setup();
    act(() => api.form?.setValue('bio', 'Set'));
    expect(textarea.value).toBe('Set');
    act(() => api.form?.reset());
    expect(textarea.value).toBe('First line\nSecond line');
  });

  it('blocks submit on a failed rule, and aria-invalid reaches the textarea', async () => {
    const { onSubmit, textarea } = setup();
    fireEvent.change(textarea, { target: { value: '' } });
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select with react-hook-form', () => {
  // Select is a native <select> with no state of its own, so register() is the binding.
  // As with Input, the box must not get in the way: ref, name, onChange and onBlur all
  // have to reach the <select>.
  type Values = { fruit: string };

  function setup() {
    const api: { form?: ReturnType<typeof useForm<Values>> } = {};
    const onSubmit = vi.fn();

    function Form() {
      const form = useForm<Values>({ defaultValues: { fruit: 'apple' } });
      api.form = form;
      const error = form.formState.errors.fruit;
      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Select
            aria-label="Fruit"
            aria-invalid={error ? true : undefined}
            {...form.register('fruit', { required: true })}
          >
            <option value="">Choose…</option>
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
          </Select>
          <button type="submit">Save</button>
        </form>
      );
    }

    render(<Form />);
    return { api, onSubmit, select: screen.getByRole<HTMLSelectElement>('combobox') };
  }

  it('shows defaultValues and reads what the user picks', () => {
    const { api, select } = setup();
    expect(select.value).toBe('apple');
    fireEvent.change(select, { target: { value: 'banana' } });
    expect(api.form?.getValues('fruit')).toBe('banana');
  });

  it('is driven by setValue and reset', () => {
    const { api, select } = setup();
    act(() => api.form?.setValue('fruit', 'banana'));
    expect(select.value).toBe('banana');
    act(() => api.form?.reset());
    expect(select.value).toBe('apple');
  });

  it('blocks submit on the empty prompt, and aria-invalid reaches the select', async () => {
    const { onSubmit, select } = setup();
    fireEvent.change(select, { target: { value: '' } });
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('OtpInput with react-hook-form', () => {
  // The <input> is native, but its value lives in React, because the boxes draw it — the
  // RadioGroup case. Controller is the binding; the ref still reaches the <input>, so
  // focus-on-error lands on the control.
  type Values = { code: string };

  function setup() {
    const api: { form?: ReturnType<typeof useForm<Values>> } = {};
    const onSubmit = vi.fn();

    function Form() {
      const form = useForm<Values>({ defaultValues: { code: '12' } });
      api.form = form;
      return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Controller
            control={form.control}
            name="code"
            rules={{ pattern: { value: /^\d{4}$/, message: 'Enter all 4 digits' } }}
            render={({ field, fieldState }) => (
              <OtpInput
                length={4}
                aria-label="Code"
                aria-invalid={fieldState.error ? true : undefined}
                ref={field.ref}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <button type="submit">Verify</button>
        </form>
      );
    }

    render(<Form />);
    return { api, onSubmit, input: () => screen.getByRole<HTMLInputElement>('textbox') };
  }

  it('shows defaultValues and reads what the user types, cleaned', () => {
    const { api, input } = setup();
    expect(input().value).toBe('12');
    fireEvent.change(input(), { target: { value: '12a3' } });
    expect(api.form?.getValues('code')).toBe('123');
  });

  it('is driven by setValue and reset, boxes included', () => {
    const { api, input } = setup();
    act(() => api.form?.setValue('code', '9876'));
    expect(input().value).toBe('9876');
    expect(document.querySelectorAll('.otp-input-slot[data-filled]')).toHaveLength(4);
    act(() => api.form?.reset());
    expect(input().value).toBe('12');
  });

  it('blocks submit until the code is complete, then submits it', async () => {
    const { onSubmit, input } = setup();
    await act(async () => fireEvent.click(screen.getByText('Verify')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveFocus();
    fireEvent.change(input(), { target: { value: '1234' } });
    await act(async () => fireEvent.click(screen.getByText('Verify')));
    expect(onSubmit).toHaveBeenCalledWith({ code: '1234' }, expect.anything());
  });

  it('blocks submit while a box is emptied in place, though the length is full', async () => {
    const { api, onSubmit } = setup();
    act(() => api.form?.setValue('code', '12 4'));
    await act(async () => fireEvent.click(screen.getByText('Verify')));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.otp-input-slot[data-filled]')).toHaveLength(3);
  });
});

describe('reset() across a whole form', () => {
  // react-hook-form's reset() sets its own values and then calls the native form.reset(). The
  // controls must not then report a reset of their own through the handlers of the render
  // before: a checkbox group sharing one array would write the old array back.
  type Values = { name: string; tags: string[]; plan: string | null; on: boolean; code: string };
  const defaults: Values = { name: '', tags: [], plan: null, on: false, code: '' };

  function setup() {
    const api: { form?: ReturnType<typeof useForm<Values>> } = {};
    function Form() {
      const form = useForm<Values>({ defaultValues: defaults });
      api.form = form;
      return (
        <form>
          <Input aria-label="Name" {...form.register('name')} />
          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <>
                {['a', 'b'].map((tag) => (
                  <Checkbox.Root
                    key={tag}
                    aria-label={tag}
                    checked={field.value.includes(tag)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked === true
                          ? [...field.value, tag]
                          : field.value.filter((t) => t !== tag),
                      )
                    }
                  />
                ))}
              </>
            )}
          />
          <Controller
            control={form.control}
            name="plan"
            render={({ field }) => (
              <RadioGroup.Root
                aria-label="Plan"
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <RadioGroup.Item value="free" aria-label="Free" />
                <RadioGroup.Item value="pro" aria-label="Pro" />
              </RadioGroup.Root>
            )}
          />
          <Controller
            control={form.control}
            name="on"
            render={({ field }) => (
              <Switch.Root aria-label="On" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Controller
            control={form.control}
            name="code"
            render={({ field }) => (
              <OtpInput
                aria-label="Code"
                length={4}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
        </form>
      );
    }
    render(<Form />);
    return api;
  }

  it('returns every control to its default, and the form with it', async () => {
    const api = setup();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByLabelText('a'));
    fireEvent.click(screen.getByLabelText('b'));
    fireEvent.click(screen.getByLabelText('Pro'));
    fireEvent.click(screen.getByLabelText('On'));
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '1234' } });
    expect(api.form?.getValues()).toEqual({
      name: 'Ada',
      tags: ['a', 'b'],
      plan: 'pro',
      on: true,
      code: '1234',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(api.form?.getValues()).toEqual(defaults);
    expect(screen.getByLabelText('a')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('b')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('Pro')).not.toBeChecked();
    expect(screen.getByLabelText('On')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('Code')).toHaveValue('');
  });
});
