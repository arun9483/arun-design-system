import { useState } from 'react';
import { Button, RangeSlider } from '@arun-dev/ui';

// Uncontrolled in a form: each end submits under its own name, and Reset returns the range to
// where it started.
export default function RangeSliderForm() {
  const [sent, setSent] = useState('');
  return (
    <form
      style={{ display: 'grid', gap: 'var(--space-sm)', maxInlineSize: '20rem' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(new URLSearchParams(new FormData(event.currentTarget) as never).toString());
      }}
    >
      <span id="range-slider-age">Age</span>
      <RangeSlider.Root
        aria-labelledby="range-slider-age"
        min={18}
        max={80}
        defaultValue={[25, 40]}
      >
        <RangeSlider.StartInput aria-label="Youngest age" name="ageMin" />
        <RangeSlider.EndInput aria-label="Oldest age" name="ageMax" />
      </RangeSlider.Root>
      <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
        <Button type="submit" variant="primary">
          Apply
        </Button>
        <Button type="reset">Reset</Button>
      </div>
      {sent && <code>{sent}</code>}
    </form>
  );
}
