import { useMemo, useState, type ReactNode } from 'react';

export type Control =
  | {
      name: string;
      type: 'select';
      options: readonly string[];
      initial: string;
      /**
       * Turns the chosen option into the value the prop actually takes, for props that
       * are not strings — `'indeterminate' | 'true' | ''` standing in for
       * `'indeterminate' | true | undefined`, say.
       *
       * Applied before both the preview and the printed JSX, so a select over a
       * non-string prop still prints something a consumer could paste.
       *
       * Not named `valueOf`: every object inherits one from `Object.prototype`, so an
       * optional field by that name is never absent and every select would be mapped
       * through it.
       */
      parse?: (option: string) => unknown;
    }
  | { name: string; type: 'boolean'; initial: boolean }
  | { name: string; type: 'text'; initial: string };

type Props<P> = {
  /** Renders the component under test with the current prop values. */
  render: (props: P) => ReactNode;
  controls: readonly Control[];
  /** Component name used when printing the JSX. */
  component: string;
  /** Children rendered inside the printed JSX. `null` for a component that takes none. */
  children?: string | null;
};

function initialValues(controls: readonly Control[]): Record<string, unknown> {
  return Object.fromEntries(controls.map((c) => [c.name, c.initial]));
}

/**
 * An empty text control means "not set". Passing `""` through would set the prop to an
 * empty string, and the printed JSX already drops it — so the preview drops it too.
 */
function omitEmpty(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v !== undefined));
}

/** Control values as the props they stand for — see `parse`. */
function resolve(
  controls: readonly Control[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => {
      const control = controls.find((c) => c.name === name);
      const mapped =
        control?.type === 'select' && control.parse ? control.parse(String(value)) : value;
      return [name, mapped];
    }),
  );
}

/** Prints the JSX a consumer would write for the current prop values. */
function toJsx(
  component: string,
  values: Record<string, unknown>,
  children: string | null,
): string {
  const attrs = Object.entries(values)
    .filter(([, v]) => v !== '' && v !== false && v !== undefined)
    .map(([k, v]) =>
      v === true ? k : typeof v === 'string' ? `${k}="${v}"` : `${k}={${String(v)}}`,
    );

  if (children === null) {
    const inline = `<${component}${attrs.map((a) => ` ${a}`).join('')} />`;
    return inline.length <= 72
      ? inline
      : [`<${component}`, ...attrs.map((a) => `  ${a}`), `/>`].join('\n');
  }

  if (attrs.length === 0) return `<${component}>${children}</${component}>`;

  const inline = `<${component} ${attrs.join(' ')}>${children}</${component}>`;
  if (inline.length <= 72) return inline;

  return [
    `<${component}`,
    ...attrs.map((a) => `  ${a}`),
    `>`,
    `  ${children}`,
    `</${component}>`,
  ].join('\n');
}

export function Playground<P>({ render, controls, component, children = 'Label' }: Props<P>) {
  const [values, setValues] = useState<Record<string, unknown>>(() => initialValues(controls));
  // The controls hold what was chosen; the component and the snippet both want what it
  // stands for, so the mapping happens once, here.
  const resolved = useMemo(() => resolve(controls, values), [controls, values]);
  const jsx = useMemo(() => toJsx(component, resolved, children), [component, resolved, children]);

  const set = (name: string, value: unknown) =>
    setValues((current) => ({ ...current, [name]: value }));

  return (
    <div className="ds-example not-content">
      <div className="ds-example-preview">
        {render({ ...omitEmpty(resolved), ...(children === null ? {} : { children }) } as P)}
      </div>

      <div className="ds-playground-controls">
        {controls.map((control) => {
          const id = `pg-${component}-${control.name}`;

          if (control.type === 'boolean') {
            return (
              <label key={control.name} className="ds-control ds-control-inline" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={Boolean(values[control.name])}
                  onChange={(e) => set(control.name, e.target.checked)}
                />
                <span>{control.name}</span>
              </label>
            );
          }

          if (control.type === 'text') {
            return (
              <label key={control.name} className="ds-control" htmlFor={id}>
                <span>{control.name}</span>
                <input
                  id={id}
                  type="text"
                  value={String(values[control.name] ?? '')}
                  onChange={(e) => set(control.name, e.target.value)}
                />
              </label>
            );
          }

          return (
            <label key={control.name} className="ds-control" htmlFor={id}>
              <span>{control.name}</span>
              <select
                id={id}
                value={String(values[control.name] ?? '')}
                onChange={(e) => set(control.name, e.target.value)}
              >
                {control.options.map((option) => (
                  <option key={option} value={option}>
                    {option || '(none)'}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <pre className="ds-playground-output">
        <code>{jsx}</code>
      </pre>
    </div>
  );
}
