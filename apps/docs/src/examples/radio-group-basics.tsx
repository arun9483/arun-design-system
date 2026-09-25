import { RadioGroup } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

export default function RadioGroupBasics() {
  return (
    <>
      {/* The group is named by its caption; each radio by the label wrapping it, which
          names a real <input> natively. Under jsx-a11y, pair each label by id as well. */}
      <span id="plan-caption" className="text-size-sm text-color-secondary">
        Plan
      </span>
      <RadioGroup.Root aria-labelledby="plan-caption" name="plan" defaultValue="pro">
        <label style={row}>
          <RadioGroup.Item value="free" />
          Free
        </label>
        <label style={row}>
          <RadioGroup.Item value="pro" />
          Pro
        </label>
        <label style={row}>
          <RadioGroup.Item value="enterprise" disabled />
          Enterprise
        </label>
      </RadioGroup.Root>
    </>
  );
}
