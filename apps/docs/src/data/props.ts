/**
 * Prop reference shown by <PropTable>.
 *
 * Hand-authored on purpose: every component's public type is
 * `XOwnProps & Omit<HTMLAttributes, …>`, so a generated table would mostly restate
 * the DOM attribute surface. Only the props the design system itself defines are
 * listed here; the shared ones are documented once in COMMON.
 *
 * apps/docs/src/data/props.unit.spec.ts asserts these names match the exported
 * types, so the table cannot silently drift.
 */
export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const COMMON: PropDoc[] = [
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
];

export const PROPS: Record<string, PropDoc[]> = {
  Button: [
    {
      name: 'variant',
      type: "'ghost' | 'primary'",
      default: "'ghost'",
      description: 'Visual weight. `primary` is the filled call to action.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Convenience for the common case: renders an `<a>` instead of a `<button>`. For a router link or any other element, use `render`.',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description:
        'Only applied to the plain button form. Defaults to `button` so it never submits a form by accident.',
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
  'Switch.Root': [
    {
      name: 'checked',
      type: 'boolean',
      description: 'Controlled state. Provide `onCheckedChange` alongside it.',
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
  Badge: [
    {
      name: 'tone',
      type: "'neutral' | 'success' | 'warning' | 'error' | 'info'",
      default: "'neutral'",
      description:
        'Generic status tone, backed by the `--color-status-*` semantic tokens. Map your own domain vocabulary onto a tone at the call site.',
    },
  ],
};
