import { useEffect, useState } from 'react';
import { Progress } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-md)', maxInlineSize: '20rem' };
const field = { display: 'grid', gap: 'var(--space-3xs)' };

export default function ProgressBasics() {
  const [done, setDone] = useState(20);
  useEffect(() => {
    const timer = setInterval(() => setDone((d) => (d >= 100 ? 0 : d + 10)), 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={stack}>
      <div style={field}>
        <label htmlFor="progress-upload">Uploading… {done}%</label>
        <Progress id="progress-upload" value={done} max={100} />
      </div>
      <div style={field}>
        {/* No value: indeterminate. */}
        <label htmlFor="progress-wait">Waiting for the server</label>
        <Progress id="progress-wait" />
      </div>
    </div>
  );
}
