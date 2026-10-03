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
  Toggle: [
    {
      name: 'pressed',
      type: 'boolean',
      description: 'Controlled state. Provide `onPressedChange` alongside it.',
    },
    {
      name: 'defaultPressed',
      type: 'boolean',
      default: 'false',
      description: 'Initial state when uncontrolled.',
    },
    {
      name: 'onPressedChange',
      type: '(pressed: boolean) => void',
      description: 'Called on every press.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Its value in a ToggleGroup: pressed while the group holds it.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Not pressable, and skipped by the arrow keys.',
    },
  ],
  ToggleGroup: [
    { name: 'value', type: 'string[]', description: "Controlled: the pressed Toggles' values." },
    {
      name: 'defaultValue',
      type: 'string[]',
      default: '[]',
      description: 'Initial value when uncontrolled.',
    },
    {
      name: 'onValueChange',
      type: '(value: string[]) => void',
      description: 'Called on every press.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Lets more than one be pressed. Without it, pressing one releases the others.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every Toggle.' },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Which arrow keys move between the Toggles.',
    },
  ],
  'Toolbar.Root': [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Which arrow keys move between items.',
    },
  ],
  'Avatar.Fallback': [
    {
      name: 'delay',
      type: 'number',
      default: '0',
      description:
        'Milliseconds before it shows, so a quick image does not flash the initials first.',
    },
  ],
  'Breadcrumb.Root': [],
  Pagination: [
    { name: 'page', type: 'number', description: 'The current page, from 1. Required.' },
    { name: 'count', type: 'number', description: 'How many pages there are. Required.' },
    {
      name: 'siblings',
      type: 'number',
      default: '1',
      description: 'Pages shown either side of the current one.',
    },
    {
      name: 'getHref',
      type: '(page: number) => string',
      description: "Each page's address: pages become links. The right choice when pages are URLs.",
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description:
        'Called with the page to go to. Without `getHref`, pages are buttons that call it.',
    },
    {
      name: 'labels',
      type: '{ previous?, next?, page? }',
      description:
        "Text of Previous and Next, and each page's accessible name — `(p) => 'Page ' + p` by default.",
    },
  ],
  'Table.Root': [
    {
      name: 'containerClassName',
      type: 'string',
      description: 'Classes for the scrolling container around the table.',
    },
  ],
  'Table.Head': [
    {
      name: 'scope',
      type: "'col' | 'row'",
      default: "'col'",
      description: 'What the header labels. `row` for the first cell of a body row.',
    },
  ],
  Kbd: [],
  'Accordion.Root': [
    {
      name: 'exclusive',
      type: 'boolean',
      default: 'false',
      description: 'Only one Item open at a time: every Item gets the same generated `name`.',
    },
  ],
  'Accordion.Item': [
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: 'Open at mount. Read once; the browser owns it after that.',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled state. Pair with `onToggle`, whose event has `newState`: `"open"` or `"closed"`.',
    },
    {
      name: 'name',
      type: 'string',
      description: "Items with the same name open one at a time, natively. Overrides the Root's.",
    },
  ],
  'Alert.Root': [
    {
      name: 'tone',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error'",
      default: "'neutral'",
      description: 'Colour, on the status tokens.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'An icon before the text. Decorative: hidden from assistive technology.',
    },
  ],
  Spinner: [
    {
      name: 'aria-label',
      type: 'string',
      default: "'Loading'",
      description: 'What is loading. Say more than the default when you can.',
    },
  ],
  Skeleton: [],
  'Toast.Provider': [
    {
      name: 'limit',
      type: 'number',
      default: '3',
      description:
        'How many show at once. The rest wait, their timers stopped, and show as others close.',
    },
    {
      name: 'timeout',
      type: 'number',
      default: '5000',
      description:
        'Milliseconds a toast stays, unless it sets its own. `0` keeps toasts until closed.',
    },
  ],
  'Toast.Viewport': [
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Dismiss'",
      description: "Accessible name of each toast's close button, in the default rendering.",
    },
    {
      name: 'children',
      type: '(toasts) => ReactNode',
      description:
        'Lay the toasts out yourself with `Toast.Root` and its parts. Omit it for the default rendering.',
    },
  ],
  Link: [],
  Separator: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'Across, or upright between inline items. Sets `aria-orientation` and `data-orientation`.',
    },
  ],
  Progress: [
    {
      name: 'value',
      type: 'number',
      description: 'How far along, up to `max`. Leave it out for an indeterminate bar.',
    },
    { name: 'max', type: 'number', default: '1', description: 'The value that means done.' },
  ],
  Meter: [
    { name: 'value', type: 'number', description: 'The measurement, between `min` and `max`.' },
    { name: 'min', type: 'number', default: '0', description: 'The bottom of the range.' },
    { name: 'max', type: 'number', default: '1', description: 'The top of the range.' },
    {
      name: 'low',
      type: 'number',
      description: 'Below this is the low region. With `high` and `optimum`, it picks the colour.',
    },
    { name: 'high', type: 'number', description: 'Above this is the high region.' },
    {
      name: 'optimum',
      type: 'number',
      description:
        'The best value. Its region is good (success); the next is fair (warning); the far one is poor (error).',
    },
  ],
  Slider: [
    { name: 'min', type: 'number', default: '0', description: 'The bottom of the range.' },
    { name: 'max', type: 'number', default: '100', description: 'The top of the range.' },
    {
      name: 'step',
      type: "number | 'any'",
      default: '1',
      description: 'The increment the keys and the thumb move by.',
    },
  ],
  'Field.Root': [
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description:
        'Shows the Error and marks the control `aria-invalid`. Yours to set: Field validates nothing.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: "Marks the control `required`, so the browser's own validation reports it.",
    },
  ],
  'Field.Control': [
    {
      name: 'render',
      type: 'ReactElement',
      default: '<Input />',
      description:
        'The control: `<Select />`, `<Textarea />`, `<Checkbox.Root />`, `<Combobox.Input />` or your own. Gets the id, `aria-describedby`, `aria-invalid`, `disabled` and `required`.',
    },
  ],
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
  OtpInput: [
    {
      name: 'length',
      type: 'number',
      default: '6',
      description: 'How many characters the code has, and so how many boxes.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled code. Provide `onValueChange` alongside it.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      default: "''",
      description: 'Initial code when uncontrolled. Also what `form.reset()` returns to.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Called with the code after every change, partial or complete.',
    },
    {
      name: 'validationType',
      type: "'numeric' | 'alphanumeric'",
      default: "'numeric'",
      description:
        'Which characters are kept. `numeric` also brings up the numeric keypad on phones.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the input and dims every box.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Goes on the row of boxes, not on the `<input>`. Every other prop, `ref` included, goes on the `<input>`.',
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
  'Combobox.Root': [
    {
      name: 'items',
      type: 'T[]',
      description:
        'Every item the list can show. With server search, the current results. Selected items need not be among them.',
    },
    {
      name: 'itemToString',
      type: '(item: T) => string',
      description:
        "An item's label: what the input shows once it is picked, and what the default filter matches. Defaults to a string item itself, else its `label`.",
    },
    {
      name: 'itemToKey',
      type: '(item: T) => string',
      description:
        "An item's identity, and the value the form submits. Defaults to `itemToString`.",
    },
    {
      name: 'filter',
      type: '((items: T[], query: string, itemToString) => T[]) | null',
      description:
        'Narrows, and may rank, the items for the typed text. Omitted: a case- and accent-insensitive "contains". `null`: no filtering, for server search.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Lets more than one item be selected. `value` is then an array.',
    },
    {
      name: 'value',
      type: 'T | null | T[]',
      description:
        'Controlled selection. Provide `onValueChange` alongside it. Use `null`, or `[]` with `multiple`, for none — never `undefined`.',
    },
    {
      name: 'defaultValue',
      type: 'T | null | T[]',
      description: 'Initial selection when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onValueChange',
      type: '(value, { reason }) => void',
      description:
        "Called on every change of the selection, with why: `'item-press'`, `'clear'`, `'chip-remove'`, `'input'` or `'form-reset'`.",
    },
    {
      name: 'inputValue',
      type: 'string',
      description: 'Controlled text of the input. Provide `onInputValueChange` alongside it.',
    },
    {
      name: 'defaultInputValue',
      type: 'string',
      description:
        "Initial text when uncontrolled. Defaults to the selected item's label, without `multiple`.",
    },
    {
      name: 'onInputValueChange',
      type: '(text, { reason }) => void',
      description:
        "Called on every change of the text, with why: `'input'` when typed, or `'item-press'`, `'clear'`, `'escape'`, `'outside-press'` or `'blur'` when the component reset it, or `'value-change'` when it followed a new `value`.",
    },
    {
      name: 'open',
      type: 'boolean',
      description: 'Controlled open state. Provide `onOpenChange` alongside it.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: 'Initial open state when uncontrolled.',
    },
    {
      name: 'onOpenChange',
      type: '(open, { reason }) => void',
      description: 'Called on every request to open or close, with why.',
    },
    {
      name: 'onItemHighlighted',
      type: '(item: T | undefined, { index, reason }) => void',
      description:
        'Called when the highlight moves, with its index in the filtered list — for a virtualizer to scroll to.',
    },
    {
      name: 'onLoadMore',
      type: '() => void',
      description: 'Called when the end of the list scrolls into view and `loading` is not set.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'More items are on their way: the list is `aria-busy`, and `Empty` stays hidden.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the input and every button.',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description:
        "Something must be selected before the form submits. Reported by the browser's own validation, on the input.",
    },
    {
      name: 'name',
      type: 'string',
      description: "Submits each selected item's key under this name, from hidden inputs.",
    },
    {
      name: 'form',
      type: 'string',
      description: 'Associates the hidden inputs with a `<form>` by id, when rendered outside it.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The other parts.',
    },
  ],
  'Combobox.Input': [
    {
      name: 'startSlot',
      type: 'ReactNode',
      description:
        'Content before the chips and text, inside the box — a search icon. Mark it `aria-hidden`.',
    },
    {
      name: 'clearLabel',
      type: 'string',
      default: "'Clear'",
      description: 'Accessible name of the Clear button.',
    },
    {
      name: 'triggerLabel',
      type: 'string',
      default: "'Show options'",
      description: 'Accessible name of the chevron that opens the list.',
    },
    {
      name: 'removeLabel',
      type: '(label: string) => string',
      default: '(label) => `Remove ${label}`',
      description: "Accessible name of a chip's remove button, from the item's label.",
    },
  ],
  'Combobox.Popup': [
    {
      name: 'side',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'bottom'",
      description:
        'Which side of the field to open on. Flips to the opposite side when there is no room.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: "Flush with the field's start or end edge, or centred on it.",
    },
  ],
  'Combobox.List': [
    {
      name: 'children',
      type: 'ReactNode | ((item: T, index: number) => ReactNode)',
      description:
        'A function rendering one `Combobox.Item` per filtered item, or the items yourself — with a virtualizer.',
    },
  ],
  'Combobox.Item': [
    {
      name: 'value',
      type: 'T',
      description: "The item this option stands for — one of the Root's `items`.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Cannot be picked, and the arrow keys skip it. A selected one can still be removed.',
    },
  ],
  'Combobox.Group': [
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables every Item inside, as `disabled` on an `<optgroup>` does.',
    },
  ],
  'Menu.Root': [
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
        'Called on every request to open or close: Trigger, an Item, Tab, Esc or a click outside. A controlled menu moves only if you accept it.',
    },
    {
      name: 'focusableWhenDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps disabled items in the arrow-key sequence, so a screen reader announces them as unavailable. They still cannot be activated.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The other parts. Root renders no element of its own.',
    },
  ],
  'Menu.Popup': [
    {
      name: 'side',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'bottom'; 'right' in a submenu",
      description:
        'Which side of the Trigger to open on. Flips to the opposite side when there is no room.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: "Flush with the Trigger's start or end edge, or centred on it.",
    },
  ],
  'Menu.Trigger': [],
  'Menu.Item': [
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Cannot be activated. Skipped by the arrow keys and typeahead, unless the Root sets `focusableWhenDisabled`.',
    },
    {
      name: 'textValue',
      type: 'string',
      description:
        'The text typeahead matches. Defaults to the text in `children`; set it when a component of yours renders the text.',
    },
  ],
  'Menu.CheckboxItem': [
    {
      name: 'checked',
      type: 'boolean',
      description:
        'Controlled state. Provide `onCheckedChange` alongside it. Never pass `undefined` — the mode is fixed at mount.',
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
      description: 'Called with the new state, in both controlled and uncontrolled modes.',
    },
    {
      name: 'closeOnClick',
      type: 'boolean',
      default: 'false',
      description:
        'Closes the menu when activated. Off by default, so several settings can be changed at once.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Cannot be activated. Skipped by the arrow keys and typeahead, unless the Root sets `focusableWhenDisabled`.',
    },
    {
      name: 'textValue',
      type: 'string',
      description:
        'The text typeahead matches. Defaults to the text in `children`; set it when a component of yours renders the text.',
    },
  ],
  'Menu.RadioGroup': [
    {
      name: 'value',
      type: 'string | null',
      description:
        'Controlled value: the `value` of the checked RadioItem, or `null` for none. Provide `onValueChange` alongside it.',
    },
    {
      name: 'defaultValue',
      type: 'string | null',
      default: 'null',
      description: 'Initial value when uncontrolled. Read once, at mount.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Called with the value of the RadioItem being checked.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables every RadioItem inside.',
    },
  ],
  'Menu.RadioItem': [
    {
      name: 'value',
      type: 'string',
      description: "Required. Checked while the RadioGroup's `value` equals it.",
    },
    {
      name: 'closeOnClick',
      type: 'boolean',
      default: 'false',
      description:
        'Closes the menu when activated. Off by default, so several settings can be changed at once.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Cannot be activated. Skipped by the arrow keys and typeahead, unless the Root sets `focusableWhenDisabled`.',
    },
    {
      name: 'textValue',
      type: 'string',
      description:
        'The text typeahead matches. Defaults to the text in `children`; set it when a component of yours renders the text.',
    },
  ],
  'Menu.SubmenuRoot': [
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
        'Called on every request to open or close: its SubmenuTrigger, the arrow keys, an Item, Esc, a click elsewhere, or the pointer moving to another item.',
    },
    {
      name: 'focusableWhenDisabled',
      type: 'boolean',
      description: "As on `Menu.Root`. Defaults to the parent menu's setting.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'A SubmenuTrigger and a Popup. Renders no element of its own.',
    },
  ],
  'Menu.SubmenuTrigger': [
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Cannot open its submenu. Skipped by the arrow keys and typeahead, unless the Root sets `focusableWhenDisabled`.',
    },
    {
      name: 'textValue',
      type: 'string',
      description:
        'The text typeahead matches in the parent menu. Defaults to the text in `children`.',
    },
  ],
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
      name: 'position',
      type: "'start' | 'end'",
      default: "'start'",
      description:
        'Which side of the panels the list sits on, along the `orientation` axis: `start` is above (horizontal) or before (vertical), `end` is below or after. Logical, so it swaps sides in a right-to-left layout. The list stays first in the DOM.',
    },
    {
      name: 'activationMode',
      type: "'automatic' | 'manual'",
      default: "'automatic'",
      description:
        '`automatic` selects a tab as soon as it has focus; `manual` waits for Enter, Space or a click.',
    },
    {
      name: 'focusableWhenDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps disabled tabs in the arrow-key sequence, so a screen reader announces them as unavailable; they still cannot be selected. Only with `activationMode="manual"` — under `"automatic"` moving focus selects, so disabled tabs are always skipped.',
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
      description:
        'Cannot be selected. Skipped by the arrow keys, unless the Root sets `focusableWhenDisabled` with manual activation.',
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
