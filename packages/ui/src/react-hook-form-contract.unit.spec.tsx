import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm, Controller, useController, useWatch } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import { Button } from './components/button';
import { Checkbox } from './components/checkbox';
import { Switch } from './components/switch';

/**
 * Contract: every control that carries a value works with react-hook-form's
 * `Controller` API, and keeps working.
 *
 * These components are not native inputs — a `<button>` holds the state and a hidden
 * `<input>` carries the form value — so nothing about that compatibility is guaranteed
 * by construction. It rests on details that are easy to change without noticing: that
 * `onCheckedChange` fires in both controlled and uncontrolled modes, that a controlled
 * component does not move unless its parent moves it, and that a native `form.reset()`
 * reports through the same callback rather than silently.
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
    await act(async () => fireEvent.click(screen.getByText('Reset')));

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
