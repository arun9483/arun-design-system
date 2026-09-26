import { Input } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

export default function InputBasics() {
  return (
    <>
      {/* The <label> names the <input>, which is where id lands — the box is only a frame. */}
      <div style={field}>
        <label htmlFor="input-name">Name</label>
        <Input id="input-name" placeholder="Ada Lovelace" />
      </div>

      <div style={field}>
        <label htmlFor="input-email">Email</label>
        <Input
          id="input-email"
          type="email"
          defaultValue="not-an-email"
          aria-invalid
          aria-describedby="input-email-error"
        />
        <small id="input-email-error" style={{ color: 'var(--color-status-error)' }}>
          Enter a valid email address.
        </small>
      </div>

      <div style={field}>
        <label htmlFor="input-disabled">Disabled</label>
        <Input id="input-disabled" defaultValue="Read me, don't edit me" disabled />
      </div>
    </>
  );
}
