import { Switch } from '@arun-dev/ui';

export default function SwitchBasics() {
  return (
    <>
      {/* A switch has no accessible name of its own — the label supplies it. */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
        <Switch.Root>
          <Switch.Thumb />
        </Switch.Root>
        Notifications
      </label>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
        <Switch.Root defaultChecked>
          <Switch.Thumb />
        </Switch.Root>
        Analytics
      </label>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
        <Switch.Root disabled>
          <Switch.Thumb />
        </Switch.Root>
        Disabled
      </label>
    </>
  );
}
