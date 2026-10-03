import { Meter } from '@arun-dev/ui';

const stack = { display: 'grid', gap: 'var(--space-md)', maxInlineSize: '20rem' };
const field = { display: 'grid', gap: 'var(--space-3xs)' };

// Test scores: high is good, so optimum sits high. Below `low` it turns red.
const classes = [
  { name: 'Class A', average: 0.9 },
  { name: 'Class B', average: 0.62 },
  { name: 'Class C', average: 0.35 },
];

export default function MeterScores() {
  return (
    <div style={stack}>
      {classes.map((group) => (
        <div key={group.name} style={field}>
          <label htmlFor={`score-${group.name}`}>
            {group.name}: {Math.round(group.average * 100)}% average
          </label>
          <Meter
            id={`score-${group.name}`}
            value={group.average}
            low={0.5}
            high={0.75}
            optimum={1}
          />
        </div>
      ))}
    </div>
  );
}
