/**
 * Playground bindings — one per component. Kept together so the controls stay
 * consistent, and so each MDX page needs a single import.
 */
import type { ComponentProps } from 'react';
import { Badge, Button, Card, Checkbox, Chip, Input, RadioGroup, Switch } from '@arun-dev/ui';
import { Playground, type Control } from './Playground';

const BUTTON_CONTROLS: Control[] = [
  { name: 'variant', type: 'select', options: ['ghost', 'primary'], initial: 'ghost' },
  { name: 'disabled', type: 'boolean', initial: false },
];

export function ButtonPlayground() {
  return (
    <Playground
      component="Button"
      controls={BUTTON_CONTROLS}
      children="Click me"
      render={(props: ComponentProps<typeof Button>) => <Button {...props} />}
    />
  );
}

const CARD_CONTROLS: Control[] = [
  { name: 'as', type: 'select', options: ['div', 'article', 'section', 'aside'], initial: 'div' },
  { name: 'lift', type: 'boolean', initial: false },
];

export function CardPlayground() {
  return (
    <Playground
      component="Card"
      controls={CARD_CONTROLS}
      children="Card content"
      render={(props: ComponentProps<typeof Card>) => (
        <Card {...props} style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' }} />
      )}
    />
  );
}

const CHIP_CONTROLS: Control[] = [
  { name: 'variant', type: 'select', options: ['default', 'accent'], initial: 'default' },
];

export function ChipPlayground() {
  return (
    <Playground
      component="Chip"
      controls={CHIP_CONTROLS}
      children="TypeScript"
      render={(props: ComponentProps<typeof Chip>) => <Chip {...props} />}
    />
  );
}

const BADGE_CONTROLS: Control[] = [
  {
    name: 'tone',
    type: 'select',
    options: ['neutral', 'success', 'warning', 'error', 'info'],
    initial: 'neutral',
  },
];

export function BadgePlayground() {
  return (
    <Playground
      component="Badge"
      controls={BADGE_CONTROLS}
      children="Status"
      render={(props: ComponentProps<typeof Badge>) => <Badge {...props} />}
    />
  );
}

const INPUT_CONTROLS: Control[] = [
  { name: 'placeholder', type: 'text', initial: 'Type here…' },
  { name: 'disabled', type: 'boolean', initial: false },
  { name: 'aria-invalid', type: 'boolean', initial: false },
];

export function InputPlayground() {
  return (
    <Playground
      component="Input"
      controls={INPUT_CONTROLS}
      children={null}
      render={(props: ComponentProps<typeof Input>) => (
        <Input {...props} aria-label="Playground input" style={{ maxInlineSize: '20rem' }} />
      )}
    />
  );
}

const CHECKBOX_CONTROLS: Control[] = [
  {
    name: 'defaultChecked',
    type: 'select',
    // '' stands for "not set", so the printed snippet drops the prop entirely rather
    // than claiming defaultChecked={false}.
    options: ['', 'true', 'indeterminate'],
    initial: '',
    parse: (option) =>
      option === 'true' ? true : option === 'indeterminate' ? 'indeterminate' : undefined,
  },
  { name: 'disabled', type: 'boolean', initial: false },
];

export function CheckboxPlayground() {
  return (
    <Playground
      component="Checkbox.Root"
      controls={CHECKBOX_CONTROLS}
      children="<Checkbox.Indicator />"
      render={(props: ComponentProps<typeof Checkbox.Root>) => (
        // `defaultChecked` is read once, at mount — changing it later is deliberately
        // ignored. Keying on it remounts the checkbox so the control demonstrates what
        // the prop does, rather than appearing inert. The key is a playground device
        // and is not part of the printed snippet.
        <Checkbox.Root key={String(props.defaultChecked)} {...props}>
          <Checkbox.Indicator />
        </Checkbox.Root>
      )}
    />
  );
}

const SWITCH_CONTROLS: Control[] = [
  { name: 'defaultChecked', type: 'boolean', initial: false },
  { name: 'disabled', type: 'boolean', initial: false },
];

export function SwitchPlayground() {
  return (
    <Playground
      component="Switch.Root"
      controls={SWITCH_CONTROLS}
      children="<Switch.Thumb />"
      render={(props: ComponentProps<typeof Switch.Root>) => (
        // `defaultChecked` is read once, at mount — changing it later is deliberately
        // ignored. Keying on it remounts the switch so the control demonstrates what the
        // prop does, rather than appearing inert. The key is a playground device and is
        // not part of the printed snippet.
        <Switch.Root key={String(props.defaultChecked)} {...props}>
          <Switch.Thumb />
        </Switch.Root>
      )}
    />
  );
}

const RADIO_GROUP_OPTIONS = ['free', 'pro', 'team'];

const RADIO_GROUP_CONTROLS: Control[] = [
  {
    name: 'defaultValue',
    type: 'select',
    // '' stands for "not set", so the printed snippet drops the prop entirely.
    options: ['', ...RADIO_GROUP_OPTIONS],
    initial: '',
    parse: (option) => (option === '' ? undefined : option),
  },
  { name: 'disabled', type: 'boolean', initial: false },
];

export function RadioGroupPlayground() {
  return (
    <Playground
      component="RadioGroup.Root"
      controls={RADIO_GROUP_CONTROLS}
      children={'<RadioGroup.Item value="free" /> …'}
      render={({ children: _snippet, ...props }: ComponentProps<typeof RadioGroup.Root>) => (
        // Keyed on `defaultValue` for the same reason as the checkbox above: it is read
        // once, at mount. The key is a playground device and is not part of the snippet.
        <RadioGroup.Root key={String(props.defaultValue)} aria-label="Plan" {...props}>
          {RADIO_GROUP_OPTIONS.map((option) => (
            <label
              key={option}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}
            >
              <RadioGroup.Item value={option} />
              {option}
            </label>
          ))}
        </RadioGroup.Root>
      )}
    />
  );
}
