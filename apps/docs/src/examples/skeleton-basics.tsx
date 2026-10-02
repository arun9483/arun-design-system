import { Skeleton } from '@arun-dev/ui';

// aria-busy on the region it stands in for: the Skeleton itself is hidden. A named <section>
// is a region, so it can carry the label.
export default function SkeletonBasics() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading profile"
      style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', inlineSize: '20rem' }}
    >
      <Skeleton
        style={{ inlineSize: '3rem', blockSize: '3rem', borderRadius: 'var(--radius-full)' }}
      />
      <div style={{ display: 'grid', gap: 'var(--space-2xs)', flex: 1 }}>
        <Skeleton style={{ inlineSize: '60%' }} />
        <Skeleton style={{ inlineSize: '90%' }} />
      </div>
    </section>
  );
}
