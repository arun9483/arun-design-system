import type { ReactNode } from 'react';

type Props = {
  title: string;
  note: string;
  children: ReactNode;
};

export function Section({ title, note, children }: Props) {
  const id = title.toLowerCase();

  return (
    <section aria-labelledby={id} className="stack space-sm">
      <div>
        <h2 id={id} className="text-size-xl font-weight-semibold">
          {title}
        </h2>
        <p className="text-size-sm text-color-secondary">{note}</p>
      </div>
      {children}
    </section>
  );
}
