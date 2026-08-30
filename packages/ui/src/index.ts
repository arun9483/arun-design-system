export { Chip } from './components/chip';
export type { ChipProps, ChipVariant } from './components/chip';
export { Card } from './components/card';
export type { CardProps } from './components/card';
export { Button } from './components/button';
export type { ButtonProps, ButtonVariant } from './components/button';
export { Badge } from './components/badge';
export type { BadgeProps, BadgeTone } from './components/badge';

// Switch is backed by @arun-dev/headless, which owns its props types. See
// docs/architecture.md decision 6 — consumers derive them with ComponentProps.
export { Switch } from './components/switch';
