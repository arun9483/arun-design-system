import { useMemo, useState, type ReactNode } from 'react';

export type Control =
  | { name: string; type: 'select'; options: readonly string[]; initial: string }
  | { name: string; type: 'boolean'; initial: boolean }
  | { name: string; type: 'text'; initial: string };

type Props<P> = {
  /** Renders the component under test with the current prop values. */
  render: (props: P) => ReactNode;
  controls: readonly Control[];
  /** Component name used when printing the JSX. */
  component: string;
  /** Children rendered inside the printed JSX. */
  children?: string;
};

function initialValues(controls: readonly Control[]): Record<string, unknown> {
  return Object.fromEntries(controls.map((c) => [c.name, c.initial]));
}

/** Prints the JSX a consumer would write for the current prop values. */
function toJsx(component: string, values: Record<string, unknown>, children: string): string {
  const attrs = Object.entries(values)
    .filter(([, v]) => v !== '' && v !== false && v !== undefined)
    .map(([k, v]) =>
      v === true ? k : typeof v === 'string' ? `${k}="${v}"` : `${k}={${String(v)}}`,
    );

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
  const jsx = useMemo(() => toJsx(component, values, children), [component, values, children]);

  const set = (name: string, value: unknown) =>
    setValues((current) => ({ ...current, [name]: value }));

  return (
    <div className="ds-example not-content">
      <div className="ds-example-preview">{render({ ...values, children } as P)}</div>

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
