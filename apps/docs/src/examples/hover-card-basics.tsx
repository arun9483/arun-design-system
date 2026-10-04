import { Avatar, HoverCard, Link, Paragraph, Stack, Text } from '@arun-dev/ui';

const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#7c3aed"/><circle cx="20" cy="16" r="7" fill="#ede9fe"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#ede9fe"/></svg>',
  );

export default function HoverCardBasics() {
  return (
    <Paragraph>
      Reviewed by{' '}
      <HoverCard.Root>
        {/* The trigger is a real link: a tap follows it, and the card only adds detail. */}
        <HoverCard.Trigger render={<Link href="#ada" />}>@ada</HoverCard.Trigger>
        <HoverCard.Popup>
          <Stack direction="row" gap="sm" align="start">
            <Avatar.Root>
              <Avatar.Image src={photo} alt="" />
              <Avatar.Fallback>AL</Avatar.Fallback>
            </Avatar.Root>
            <Stack gap="3xs">
              <Text weight="semibold">Ada Lovelace</Text>
              <Text color="secondary">Analyst. Writes the notes everyone else reads.</Text>
              <Link href="#ada-repos">12 repositories</Link>
            </Stack>
          </Stack>
        </HoverCard.Popup>
      </HoverCard.Root>{' '}
      on 4 October.
    </Paragraph>
  );
}
