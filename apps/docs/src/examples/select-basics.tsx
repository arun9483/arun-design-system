import { Select } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

export default function SelectBasics() {
  return (
    <>
      {/* The empty-value option is the prompt: required rejects it, and it reads muted. */}
      <div style={field}>
        <label htmlFor="select-country">Country</label>
        <Select id="select-country" required defaultValue="">
          <option value="" disabled>
            Choose a country…
          </option>
          <option value="in">India</option>
          <option value="jp">Japan</option>
          <option value="gb">United Kingdom</option>
          <option value="us">United States</option>
        </Select>
      </div>

      <div style={field}>
        <label htmlFor="select-plan">Plan</label>
        <Select id="select-plan" defaultValue="" aria-invalid aria-describedby="select-plan-error">
          <option value="">Choose a plan…</option>
          <optgroup label="Monthly">
            <option value="starter-monthly">Starter</option>
            <option value="team-monthly">Team</option>
          </optgroup>
          <optgroup label="Yearly">
            <option value="starter-yearly">Starter</option>
            <option value="team-yearly">Team</option>
          </optgroup>
        </Select>
        <small id="select-plan-error" style={{ color: 'var(--color-status-error)' }}>
          Pick a plan to continue.
        </small>
      </div>

      <div style={field}>
        <label htmlFor="select-disabled">Disabled</label>
        <Select id="select-disabled" defaultValue="read" disabled>
          <option value="read">Read only</option>
          <option value="write">Read and write</option>
        </Select>
      </div>
    </>
  );
}
