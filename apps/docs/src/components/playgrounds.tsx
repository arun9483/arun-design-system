/**
 * Playground bindings — one per component. Kept together so the controls stay
 * consistent, and so each MDX page needs a single import.
 */
import type { ComponentProps } from 'react';
import { Badge, Button, Card, Chip } from '@arun-dev/ui';
import { Playground, type Control } from './Playground';

const BUTTON_CONTROLS: Control[] = [
  { name: 'variant', type: 'select', options: ['ghost', 'primary'], initial: 'ghost' },
  { name: 'disabled', type: 'boolean', initial: false },
  { name: 'href', type: 'text', initial: '' },
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
