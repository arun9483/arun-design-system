import { Meter } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-md)', maxInlineSize: '20rem' };
const field = { display: 'grid', gap: 'var(--space-3xs)' };

// Disk usage: low is good, so optimum sits low. Past `high` it turns red.
const disks = [
  { name: 'Photos', used: 0.3 },
  { name: 'Projects', used: 0.68 },
  { name: 'Backups', used: 0.92 },
];

export default function MeterBasics() {
  return (
    <div style={stack}>
      {disks.map((disk) => (
        <div key={disk.name} style={field}>
          <label htmlFor={`meter-${disk.name}`}>
            {disk.name}: {Math.round(disk.used * 100)}% used
          </label>
          <Meter id={`meter-${disk.name}`} value={disk.used} low={0.6} high={0.85} optimum={0.1} />
        </div>
      ))}
    </div>
  );
}
