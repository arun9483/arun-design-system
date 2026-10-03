import { useState } from 'react';
import { Toggle, ToggleGroup } from '@arun-dev/ui';

export default function ToggleBasics() {
  const [muted, setMuted] = useState(true);
  const [align, setAlign] = useState<string[]>(['left']);
  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}
    >
      {/* The name stays "Mute notifications"; aria-pressed says whether it's on, and the
          icon follows the same state. */}
      <Toggle pressed={muted} onPressedChange={setMuted} aria-label="Mute notifications">
        <span aria-hidden>{muted ? '🔕' : '🔔'}</span> Mute
      </Toggle>
      {/* One at a time: Tab reaches the pressed one, the arrow keys move along. */}
      <ToggleGroup aria-label="Alignment" value={align} onValueChange={setAlign}>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>
      <ToggleGroup aria-label="Style" multiple defaultValue={['bold']}>
        <Toggle value="bold">B</Toggle>
        <Toggle value="italic">I</Toggle>
        <Toggle value="underline">U</Toggle>
      </ToggleGroup>
    </div>
  );
}
