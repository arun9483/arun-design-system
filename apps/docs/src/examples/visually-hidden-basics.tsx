import { Badge, Button, Link, Stack } from '@arun-dev/ui';

export default function VisuallyHiddenBasics() {
  return (
    <Stack gap="sm" align="start">
      {/* Extra context only a screen reader needs: sighted users see the arrow. */}
      <Link href="https://example.com" target="_blank" rel="noreferrer">
        Release notes ↗<span className="sr-only"> (opens in a new tab)</span>
      </Link>

      {/* A button with only an icon still needs a name. */}
      <Button>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a5 5 0 0 0-5 5v3L1.5 11v1h13v-1L13 9V6a5 5 0 0 0-5-5Zm0 15a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2Z" />
        </svg>
        <span className="sr-only">Notifications</span>
      </Button>

      {/* A number whose meaning is clear from the layout, spelled out for a screen reader. */}
      <Badge tone="info">
        3<span className="sr-only"> unread messages</span>
      </Badge>
    </Stack>
  );
}
