import { useState } from 'react';
import { Button, Field, OtpInput } from '@arun-dev/ui';

const LENGTH = 6;
// Complete means every box holds a digit. A box emptied in place is a space, so the length
// alone is not enough: "123 56" has six characters. Only the Verify button needs this;
// onComplete already knows.
const COMPLETE = /^\d{6}$/;

export default function OtpInputVerify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  function verify(value: string) {
    // Your server checks the code. Here, 123456 is the right one.
    if (value === '123456') {
      setVerified(true);
      setError('');
    } else {
      setError(COMPLETE.test(value) ? 'That code is not right.' : `Enter all ${LENGTH} digits.`);
    }
  }

  return (
    <form
      noValidate
      style={{ display: 'grid', gap: 'var(--space-sm)', justifyItems: 'start' }}
      onSubmit={(event) => {
        event.preventDefault();
        verify(code);
      }}
    >
      <Field.Root invalid={error !== ''}>
        <Field.Label>Verification code</Field.Label>
        <Field.Control
          render={
            <OtpInput
              length={LENGTH}
              name="code"
              value={code}
              onValueChange={(next) => {
                setCode(next);
                setError('');
                setVerified(false);
              }}
              // Checks as soon as every box is filled, so there is nothing more to press.
              onComplete={verify}
            />
          }
        />
        <Field.Description>
          We sent it to •••• 0142. Try 123456, or paste &ldquo;123 456&rdquo;.
        </Field.Description>
        <Field.Error>{error}</Field.Error>
      </Field.Root>
      <Button type="submit" variant="primary">
        Verify
      </Button>
      <p role="status" style={{ margin: 0, minBlockSize: '1.5em' }}>
        {verified ? 'Verified.' : ''}
      </p>
    </form>
  );
}
