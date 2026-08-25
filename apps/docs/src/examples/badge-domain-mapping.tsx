import { Badge, type BadgeTone } from '@arun-dev/ui';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Domain vocabulary belongs to your app, not the design system. Map it onto a tone
// at the call site, where `satisfies` makes a typo a compile error.
const DIFFICULTY = {
  beginner: { label: 'Beginner', tone: 'success' },
  intermediate: { label: 'Intermediate', tone: 'warning' },
  advanced: { label: 'Advanced', tone: 'error' },
} as const satisfies Record<Difficulty, { label: string; tone: BadgeTone }>;

export default function BadgeDomainMapping() {
  return (
    <>
      {(Object.keys(DIFFICULTY) as Difficulty[]).map((key) => (
        <Badge key={key} tone={DIFFICULTY[key].tone}>
          {DIFFICULTY[key].label}
        </Badge>
      ))}
    </>
  );
}
