import { Button, Tooltip } from '@arun-dev/ui';

const TOOLS = [
  { label: 'Bold', hint: 'Bold (⌘B)', glyph: 'B', style: { fontWeight: 700 } },
  { label: 'Italic', hint: 'Italic (⌘I)', glyph: 'I', style: { fontStyle: 'italic' } },
  {
    label: 'Underline',
    hint: 'Underline (⌘U)',
    glyph: 'U',
    style: { textDecoration: 'underline' },
  },
];

export default function TooltipToolbar() {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      style={{ display: 'flex', gap: 'var(--space-3xs)' }}
    >
      {TOOLS.map(({ label, hint, glyph, style }) => (
        <Tooltip.Root key={label}>
          {/* The button's name comes from aria-label; the tooltip adds the shortcut. */}
          <Tooltip.Trigger render={<Button aria-label={label} />}>
            <span aria-hidden style={style}>
              {glyph}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Popup>{hint}</Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </div>
  );
}
