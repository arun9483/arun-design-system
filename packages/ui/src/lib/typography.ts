/** A step on the type scale: the `--text-*` token of the same name, with its paired leading. */
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

/** A text colour role: the `--color-text-*` token of the same name. */
export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent';

/** A font weight: the `--font-weight-*` token of the same name. */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * The utility classes for each prop. The type, colour and weight classes already exist in
 * the `utilities` layer, so the typography components reuse them rather than restate them.
 */
export function typographyClasses({
  size,
  color,
  weight,
}: {
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
}) {
  return [
    size && `text-size-${size}`,
    color && `text-color-${color}`,
    weight && `font-weight-${weight}`,
  ];
}
