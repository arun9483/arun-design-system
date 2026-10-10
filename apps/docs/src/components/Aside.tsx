import type { ReactNode } from 'react';
import { Alert } from '@arun-dev/ui';

const TONE = { note: 'info', tip: 'success', caution: 'warning', danger: 'error' } as const;

/**
 * A callout in the prose, drawn with the design system's own Alert. It takes the props of
 * Starlight's Aside, which it replaces, so a page reads the same either way. The description is a
 * <div>: a callout holds paragraphs, code and tables, which a <p> cannot.
 */
export default function Aside({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof TONE;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Alert.Root tone={TONE[type]} className="ds-aside">
      {title !== undefined && <Alert.Title>{title}</Alert.Title>}
      <Alert.Description render={<div />}>{children}</Alert.Description>
    </Alert.Root>
  );
}
