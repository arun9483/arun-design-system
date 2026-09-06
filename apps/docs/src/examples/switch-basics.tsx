import { Switch } from '@arun-dev/ui';

export default function SwitchBasics() {
  return (
    <>
      {/* A switch has no accessible name of its own — the label supplies it, associated
          by id so jsx-a11y accepts the <button> the switch renders. */}
      <label
        htmlFor="notifications"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}
      >
        <Switch.Root id="notifications">
          <Switch.Thumb />
        </Switch.Root>
        Notifications
      </label>

      <label
        htmlFor="analytics"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}
      >
        <Switch.Root id="analytics" defaultChecked>
          <Switch.Thumb />
        </Switch.Root>
        Analytics
      </label>

      <label
        htmlFor="disabled-example"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}
      >
        <Switch.Root id="disabled-example" disabled>
          <Switch.Thumb />
        </Switch.Root>
        Disabled
      </label>
    </>
  );
}
