import { Checkbox } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

export default function CheckboxBasics() {
  return (
    <>
      {/* A checkbox has no accessible name of its own — the label supplies it, associated
          by id so jsx-a11y accepts the <button> the checkbox renders. */}
      <label htmlFor="terms" style={row}>
        <Checkbox.Root id="terms">
          <Checkbox.Indicator />
        </Checkbox.Root>
        Accept terms
      </label>

      <label htmlFor="newsletter" style={row}>
        <Checkbox.Root id="newsletter" defaultChecked>
          <Checkbox.Indicator />
        </Checkbox.Root>
        Newsletter
      </label>

      <label htmlFor="partial" style={row}>
        <Checkbox.Root id="partial" defaultChecked="indeterminate">
          <Checkbox.Indicator />
        </Checkbox.Root>
        Indeterminate
      </label>

      <label htmlFor="checkbox-disabled" style={row}>
        <Checkbox.Root id="checkbox-disabled" disabled>
          <Checkbox.Indicator />
        </Checkbox.Root>
        Disabled
      </label>
    </>
  );
}
