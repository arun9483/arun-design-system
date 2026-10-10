import { useState } from 'react';
import { Button } from '@arun-dev/ui';

// A save that takes a moment, as an API call does: pending from the submit until it settles.
export default function ButtonPending() {
  const [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setTimeout(() => setPending(false), 2000);
      }}
    >
      <Button type="submit" variant="primary" pending={pending}>
        Save changes
      </Button>
    </form>
  );
}
