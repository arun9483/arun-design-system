import { Button, Spinner } from '@arun-dev/ui';

export default function SpinnerBasics() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <Spinner />
      <Spinner aria-label="Saving draft" style={{ ['--spinner-size' as string]: '2rem' }} />
      {/* In a button, the text already says what is happening: hide the spinner. */}
      <Button disabled>
        <Spinner aria-hidden="true" style={{ ['--spinner-size' as string]: '1rem' }} /> Saving…
      </Button>
    </div>
  );
}
