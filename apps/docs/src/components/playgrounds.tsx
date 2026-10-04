/**
 * Playground bindings — one per component. Kept together so the controls stay
 * consistent, and so each MDX page needs a single import.
 */
import { useState, type ComponentProps } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Drawer,
  HoverCard,
  Link,
  Stepper,
  Input,
  RadioGroup,
  Select,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
} from '@arun-dev/ui';
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

const TEXTAREA_CONTROLS: Control[] = [
  { name: 'placeholder', type: 'text', initial: 'Write something…' },
  { name: 'autoResize', type: 'boolean', initial: false },
  { name: 'disabled', type: 'boolean', initial: false },
  { name: 'aria-invalid', type: 'boolean', initial: false },
];

export function TextareaPlayground() {
  return (
    <Playground
      component="Textarea"
      controls={TEXTAREA_CONTROLS}
      children={null}
      render={(props: ComponentProps<typeof Textarea>) => (
        <Textarea {...props} aria-label="Playground textarea" style={{ maxInlineSize: '24rem' }} />
      )}
    />
  );
}

const SELECT_CONTROLS: Control[] = [
  { name: 'required', type: 'boolean', initial: false },
  { name: 'disabled', type: 'boolean', initial: false },
  { name: 'aria-invalid', type: 'boolean', initial: false },
];

export function SelectPlayground() {
  return (
    <Playground
      component="Select"
      controls={SELECT_CONTROLS}
      // Printed in the snippet; the preview renders real options instead.
      children="{options}"
      render={({ children: _printed, ...props }: ComponentProps<typeof Select>) => (
        <Select {...props} aria-label="Playground select" style={{ maxInlineSize: '20rem' }}>
          <option value="">Choose a fruit…</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </Select>
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
        <Checkbox.Root
          key={String(props.defaultChecked)}
          aria-label="Playground checkbox"
          {...props}
        >
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
        <Switch.Root key={String(props.defaultChecked)} aria-label="Playground switch" {...props}>
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

const TABS_CONTROLS: Control[] = [
  {
    name: 'orientation',
    type: 'select',
    options: ['horizontal', 'vertical'],
    initial: 'horizontal',
  },
  { name: 'position', type: 'select', options: ['start', 'end'], initial: 'start' },
  {
    name: 'activationMode',
    type: 'select',
    options: ['automatic', 'manual'],
    initial: 'automatic',
  },
];

export function TabsPlayground() {
  return (
    <Playground
      component="Tabs.Root"
      controls={TABS_CONTROLS}
      children="<Tabs.List /> …"
      render={({ children: _snippet, ...props }: ComponentProps<typeof Tabs.Root>) => (
        // `resize` makes the frame draggable, so the narrow layout can be tried without
        // resizing the window — the tabs react to their container's width, not the viewport's.
        // The frame and its hint are playground devices and are not part of the snippet.
        <div style={{ inlineSize: '100%' }}>
          <div
            style={{
              resize: 'horizontal',
              overflow: 'auto',
              minInlineSize: '12rem',
              maxInlineSize: '100%',
              padding: 'var(--space-sm)',
              border: '1px dashed var(--color-border-default)',
            }}
          >
            <Tabs.Root defaultValue="account" {...props}>
              <Tabs.List aria-label="Settings">
                <Tabs.Tab value="account">Account</Tabs.Tab>
                <Tabs.Tab value="billing">Billing</Tabs.Tab>
                <Tabs.Tab value="team" disabled>
                  Team
                </Tabs.Tab>
                <Tabs.Tab value="security">Security</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="account">Name, email and avatar.</Tabs.Panel>
              <Tabs.Panel value="billing">Plan, invoices and payment method.</Tabs.Panel>
              <Tabs.Panel value="team">Members and roles.</Tabs.Panel>
              <Tabs.Panel value="security">Password and two-factor authentication.</Tabs.Panel>
            </Tabs.Root>
          </div>
          <p style={{ margin: 'var(--space-xs) 0 0', fontSize: 'var(--text-sm)' }}>
            Click a tab, then use the arrow keys: with <code>automatic</code> each arrow selects the
            tab it reaches; with <code>manual</code> it only moves focus, and Enter or Space
            selects. Drag the frame's bottom-right corner to narrow it.
          </p>
        </div>
      )}
    />
  );
}

const ACCORDION_CONTROLS: Control[] = [{ name: 'exclusive', type: 'boolean', initial: true }];

export function AccordionPlayground() {
  return (
    <Playground
      component="Accordion.Root"
      controls={ACCORDION_CONTROLS}
      children="<Accordion.Item /> …"
      render={({ children: _snippet, ...props }: ComponentProps<typeof Accordion.Root>) => (
        <div style={{ inlineSize: '28rem', maxInlineSize: '100%' }}>
          <Accordion.Root {...props}>
            {['Shipping', 'Returns', 'Warranty'].map((topic) => (
              <Accordion.Item key={topic}>
                <Accordion.Trigger>{topic}</Accordion.Trigger>
                <Accordion.Panel>Everything about {topic.toLowerCase()}.</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          <p style={{ margin: 'var(--space-xs) 0 0', fontSize: 'var(--text-sm)' }}>
            Open two items: with <code>exclusive</code> the first closes as the second opens;
            without it, both stay open.
          </p>
        </div>
      )}
    />
  );
}

const TOOLTIP_CONTROLS: Control[] = [
  { name: 'side', type: 'select', options: ['top', 'right', 'bottom', 'left'], initial: 'top' },
  { name: 'align', type: 'select', options: ['start', 'center', 'end'], initial: 'center' },
];

export function TooltipPlayground() {
  return (
    <Playground
      component="Tooltip.Popup"
      controls={TOOLTIP_CONTROLS}
      children="Saves the draft"
      render={({ children, ...props }: ComponentProps<typeof Tooltip.Popup>) => (
        // Kept open, so the placement can be seen while the controls change. The padding
        // leaves room on every side for it to sit without flipping. Remounted on each change:
        // Chromium can keep an open popup's last fallback when its position-area changes, and a
        // tooltip that opens with its placement — as one always does in an app — has none.
        <div style={{ padding: 'var(--space-2xl) var(--space-3xl)' }}>
          <Tooltip.Root open key={`${props.side}-${props.align}`}>
            <Tooltip.Trigger render={<Button />}>Save</Tooltip.Trigger>
            <Tooltip.Popup {...props}>{children}</Tooltip.Popup>
          </Tooltip.Root>
        </div>
      )}
    />
  );
}

const LIST_ITEMS = ['Design', 'Engineering', 'Product'];

/**
 * Lists are plain elements, not a component, so the generic Playground — which prints one
 * component's props — does not fit: here the element itself is a control. Same markup and
 * classes, so it looks like every other playground.
 */
export function ListPlayground() {
  const [element, setElement] = useState<'ul' | 'ol'>('ul');
  const [role, setRole] = useState<'' | 'list'>('');
  const List = element;
  const open = role ? `<${element} role="list">` : `<${element}>`;
  const jsx = [open, ...LIST_ITEMS.map((item) => `  <li>${item}</li>`), `</${element}>`].join('\n');

  return (
    <div className="ds-example not-content">
      <div className="ds-example-preview">
        <List role={role || undefined}>
          {LIST_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      </div>

      <div className="ds-playground-controls">
        <label className="ds-control" htmlFor="pg-list-element">
          <span>element</span>
          <select
            id="pg-list-element"
            value={element}
            onChange={(e) => setElement(e.target.value as 'ul' | 'ol')}
          >
            <option value="ul">ul</option>
            <option value="ol">ol</option>
          </select>
        </label>
        <label className="ds-control" htmlFor="pg-list-role">
          <span>role</span>
          <select
            id="pg-list-role"
            value={role}
            onChange={(e) => setRole(e.target.value as '' | 'list')}
          >
            <option value="">(none)</option>
            <option value="list">list</option>
          </select>
        </label>
      </div>

      <pre className="ds-playground-output" tabIndex={0}>
        <code>{jsx}</code>
      </pre>
    </div>
  );
}

const DRAWER_CONTROLS: Control[] = [
  { name: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'], initial: 'bottom' },
];

export function DrawerPlayground() {
  return (
    <Playground
      component="Drawer.Popup"
      controls={DRAWER_CONTROLS}
      children="Drawer content"
      render={(props: ComponentProps<typeof Drawer.Popup>) => (
        <Drawer.Root>
          <Drawer.Trigger render={<Button />}>Open from the {String(props.side)}</Drawer.Trigger>
          <Drawer.Popup {...props} aria-label="Playground drawer" />
        </Drawer.Root>
      )}
    />
  );
}

const HOVER_CARD_CONTROLS: Control[] = [
  { name: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'], initial: 'bottom' },
  { name: 'align', type: 'select', options: ['center', 'start', 'end'], initial: 'center' },
];

export function HoverCardPlayground() {
  return (
    <Playground
      component="HoverCard.Popup"
      controls={HOVER_CARD_CONTROLS}
      children="Card content"
      render={(props: ComponentProps<typeof HoverCard.Popup>) => (
        <HoverCard.Root>
          <HoverCard.Trigger render={<Link href="#playground" />}>
            Hover or focus me
          </HoverCard.Trigger>
          <HoverCard.Popup {...props} />
        </HoverCard.Root>
      )}
    />
  );
}

const STEPPER_CONTROLS: Control[] = [
  {
    name: 'orientation',
    type: 'select',
    options: ['horizontal', 'vertical'],
    initial: 'horizontal',
  },
];

export function StepperPlayground() {
  return (
    <Playground
      component="Stepper.Root"
      controls={STEPPER_CONTROLS}
      children="…"
      render={(props: ComponentProps<typeof Stepper.Root>) => (
        <Stepper.Root {...props} aria-label="Playground steps" style={{ inlineSize: '100%' }}>
          <Stepper.Item status="complete">Details</Stepper.Item>
          <Stepper.Item status="current">Plan</Stepper.Item>
          <Stepper.Item>Payment</Stepper.Item>
        </Stepper.Root>
      )}
    />
  );
}
