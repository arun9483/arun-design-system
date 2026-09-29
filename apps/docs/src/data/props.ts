/**
 * Prop reference shown by <PropTable>.
 *
 * Hand-authored on purpose: every component's public type is
 * `XOwnProps & Omit<HTMLAttributes, …>`, so a generated table would mostly restate
 * the DOM attribute surface. Only the props the design system itself defines are
 * listed here; the shared ones are documented once in COMMON.
 *
 * props.assert.ts checks these names against the exported prop types at compile time,
 * so a renamed or removed prop fails `pnpm typecheck` rather than going stale here.
 */
export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const COMMON = [
  {
    name: 'className',
    type: 'string',
    description: "Concatenated with the component's own classes, never replacing them.",
  },
  {
    name: 'render',
    type: 'ReactElement',
    description:
      'Element or component to render instead of the default. Props, className, event handlers and ref are merged onto it.',
  },
  {
    name: 'ref',
    type: 'Ref<HTMLElement>',
    description: 'Ref to the rendered element. Merged with any ref on the `render` element.',
  },
  {
    name: '…rest',
    type: 'HTMLAttributes',
    description:
      'Anything else is spread onto the rendered element, so id, aria-*, data-* and event handlers all reach the DOM.',
  },
] as const satisfies readonly PropDoc[];

export const PROPS = {
  Button: [
    {
      name: 'variant',
      type: "'ghost' | 'primary'",
      default: "'ghost'",
      description: 'Visual weight. `primary` is the filled call to action.',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: 'Defaults to `button` so it never submits a form by accident.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents activation, using the platform rather than synthesising it.',
    },
  ],
  Card: [
    {
      name: 'as',
      type: 'keyof JSX.IntrinsicElements',
      default: "'div'",
      description: 'Tag to render. Use `render` when you need a component rather than a tag name.',
    },
    {
      name: 'lift',
      type: 'boolean',
      default: 'false',
      description: 'Raises the card on hover. For cards that are themselves interactive.',
    },
  ],
  Chip: [
    {
      name: 'variant',
      type: "'default' | 'accent'",
      default: "'default'",
      description: 'Neutral for tags and filters, accent for emphasis.',
    },
  ],
  Input: [
    {
      name: 'startSlot',
      type: 'ReactNode',
      description:
        'Content before the text, inside the box: an icon, prefix or button. Mark decorative icons `aria-hidden`.',
    },
    {
      name: 'endSlot',
      type: 'ReactNode',
      description:
        'Content after the text, inside the box: a unit, hint, or clear or reveal button.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Goes on the box that frames the input and its slots, not on the `<input>`. Every other prop, `ref` and `render` included, goes on the `<input>`.',
    },
  ],
  Textarea: [
    {
      name: 'autoResize',
      type: 'boolean',
      default: 'false',
      description:
        'Grow with the content between `--textarea-min-height` and `--textarea-max-height`, then scroll. CSS only (`field-sizing: content`); browsers without it keep the `rows` height.',
    },
  ],
  Select: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The `<option>` and `<optgroup>` elements, as for a native `<select>`. An option with `value=""` selected reads as a placeholder.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Goes on the box that frames the select and its chevron, not on the `<select>`. Every other prop, `ref` and `render` included, goes on the `<select>`.',
    },
  ],
  'Checkbox.Root': [
    {
      name: 'checked',
      type: "boolean | 'indeterminate'",
      description:
        'Controlled state. Provide `onCheckedChange` alongside it. Never pass `undefined` — the mode is fixed at mount, so write `checked={x ?? false}`.',
    },
    {
      name: 'defaultChecked',
      type: "boolean | 'indeterminate'",
      default: 'false',
      description: 'Initial state when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onCheckedChange',
      type: "(checked: boolean | 'indeterminate') => void",
      description:
        'Called with the value being moved to, in both controlled and uncontrolled modes. A click never moves to `indeterminate` — only a parent can set it.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents activation.' },
    {
      name: 'name',
      type: 'string',
      description:
        'Submits with the enclosing form when checked. An unchecked or indeterminate checkbox contributes nothing, mirroring a native checkbox.',
    },
    {
      name: 'value',
      type: 'string',
      default: "'on'",
      description: 'Value submitted when checked.',
    },
  ],
  'Checkbox.Indicator': [],
  'RadioGroup.Root': [
    {
      name: 'value',
      type: 'string | null',
      description:
        "Controlled value — the selected item's `value`, or `null` for none. Provide `onValueChange` alongside it. Never pass `undefined` — the mode is fixed at mount, so write `value={x ?? null}`.",
    },
    {
      name: 'defaultValue',
      type: 'string | null',
      default: 'null',
      description: 'Initial value when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onValueChange',
      type: '(value: string | null) => void',
      description:
        'Called with the value being moved to, in both modes. `null` arrives only from `form.reset()` returning a group that mounted with nothing selected.',
    },
    {
      name: 'name',
      type: 'string',
      default: 'generated',
      description:
        'Shared by every radio — the platform groups radios by name — and submitted with the form. Pass your own inside a form; a generated one still submits.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every radio.' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: 'Blocks form submission until a radio is selected, via native validation.',
    },
    {
      name: 'form',
      type: 'string',
      description:
        'Id of the `<form>` the radios belong to, when the group is rendered outside it.',
    },
  ],
  'RadioGroup.Item': [
    {
      name: 'value',
      type: 'string',
      description:
        "Required. The group's value when this radio is selected, and what the form submits for it.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables this radio alone. A disabled group disables it regardless.',
    },
  ],
  'Switch.Root': [
    {
      name: 'checked',
      type: 'boolean',
      description:
        'Controlled state. Provide `onCheckedChange` alongside it. Never pass `undefined` — the mode is fixed at mount, so write `checked={x ?? false}`.',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      default: 'false',
      description: 'Initial state when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean) => void',
      description:
        'Called with the value being moved to, in both controlled and uncontrolled modes.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents activation.' },
    {
      name: 'name',
      type: 'string',
      description:
        'Submits with the enclosing form when checked. An unchecked switch contributes nothing, mirroring a native checkbox.',
    },
    {
      name: 'value',
      type: 'string',
      default: "'on'",
      description: 'Value submitted when checked.',
    },
  ],
  'Switch.Thumb': [],
  'Dialog.Root': [
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled state. Provide `onOpenChange` alongside it. Never pass `undefined` — the mode is fixed at mount.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: 'Initial state when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Called on every request to open or close: Trigger, Close, Esc, a backdrop click or a `<form method="dialog">`. A controlled dialog moves only if you accept it.',
    },
    {
      name: 'closeOnBackdropClick',
      type: 'boolean',
      default: 'true',
      description:
        'Close when the backdrop is clicked. Turn it off where a stray click would lose work; Esc and `Dialog.Close` still close.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The other parts. Root renders no element of its own.',
    },
  ],
  'Dialog.Popup': [],
  'Dialog.Trigger': [],
  'Dialog.Title': [],
  'Dialog.Close': [],
  'Popover.Root': [
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled state. Provide `onOpenChange` alongside it. Never pass `undefined` — the mode is fixed at mount.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: 'Initial state when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Called on every request to open or close: Trigger, Close, Esc or a click outside. A controlled popover moves only if you accept it.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The other parts. Root renders no element of its own.',
    },
  ],
  'Popover.Popup': [
    {
      name: 'side',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'bottom'",
      description:
        'Which side of the Trigger to open on. Flips to the opposite side when there is no room.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: "Flush with the Trigger's start or end edge, or centred on it.",
    },
  ],
  'Popover.Trigger': [],
  'Popover.Close': [],
  'Tooltip.Root': [
    {
      name: 'delay',
      type: 'number',
      default: '600',
      description:
        'Milliseconds a pointer rests on the trigger before it opens. Keyboard focus opens it at once, and moving straight from another tooltip skips the delay.',
    },
    {
      name: 'closeDelay',
      type: 'number',
      default: '100',
      description:
        'Milliseconds between the pointer leaving and the tooltip closing — time to move onto the tooltip, which stays open while hovered.',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled state. Provide `onOpenChange` alongside it. Never pass `undefined` — the mode is fixed at mount.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: 'Initial state when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: 'Called on every open and close, after any delay has run.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The other parts. Root renders no element of its own.',
    },
  ],
  'Tooltip.Popup': [
    {
      name: 'side',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      description:
        'Which side of the Trigger to show on. Flips to the opposite side when there is no room.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: "Flush with the Trigger's start or end edge, or centred on it.",
    },
  ],
  'Tooltip.Trigger': [],
  'Tabs.Root': [
    {
      name: 'value',
      type: 'string',
      description:
        'Controlled selection: the `value` of the selected Tab. Provide `onValueChange` alongside it. Never pass `undefined` — the mode is fixed at mount.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'Initial selection when uncontrolled. Read once, at mount. Without one, no tab is selected.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: "Called with the Tab's `value` whenever the selection changes.",
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'The axis the tabs run along, and so which arrow keys move between them.',
    },
    {
      name: 'activationMode',
      type: "'automatic' | 'manual'",
      default: "'automatic'",
      description:
        '`automatic` selects a tab as soon as it has focus; `manual` waits for Enter, Space or a click.',
    },
  ],
  'Tabs.List': [],
  'Tabs.Tab': [
    {
      name: 'value',
      type: 'string',
      description: 'Identifies this tab, and the Panel with the same `value`. Required.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Skipped by the arrow keys and cannot be selected.',
    },
  ],
  'Tabs.Panel': [
    {
      name: 'value',
      type: 'string',
      description: 'The `value` of the Tab this panel belongs to. Required.',
    },
  ],
  Badge: [
    {
      name: 'tone',
      type: "'neutral' | 'success' | 'warning' | 'error' | 'info'",
      default: "'neutral'",
      description:
        'Generic status tone, backed by the `--color-status-*` semantic tokens. Map your own domain vocabulary onto a tone at the call site.',
    },
  ],
} as const satisfies Record<string, readonly PropDoc[]>;
