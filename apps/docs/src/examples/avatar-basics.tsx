import { Avatar } from '@arun-dev/ui';

// A tiny SVG stands in for a photo. The second fails to load and keeps its initials; the last
// fails too, and falls back to a placeholder picture instead.
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#7c3aed"/><circle cx="20" cy="16" r="7" fill="#ede9fe"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#ede9fe"/></svg>',
  );

// A generic silhouette, for people with no initials to show — or when you prefer a picture.
const placeholder =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#cbd5e1"/><circle cx="20" cy="16" r="7" fill="#f8fafc"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#f8fafc"/></svg>',
  );

export default function AvatarBasics() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
      <Avatar.Root>
        <Avatar.Image src={photo} alt="Ada Lovelace" />
        <Avatar.Fallback delay={300}>AL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root role="img" aria-label="Grace Hopper">
        <Avatar.Image src="data:image/png;base64,broken" alt="Grace Hopper" />
        <Avatar.Fallback aria-hidden="true">GH</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root role="img" aria-label="Unknown user">
        <Avatar.Image src="data:image/png;base64,broken" alt="" />
        {/* Any content can be the fallback: here an image, filling the circle. */}
        <Avatar.Fallback aria-hidden="true">
          <img src={placeholder} alt="" style={{ inlineSize: '100%', blockSize: '100%' }} />
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root
        role="img"
        aria-label="Alan Turing"
        style={{ ['--avatar-size' as string]: '3.5rem' }}
      >
        <Avatar.Fallback aria-hidden="true">AT</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
