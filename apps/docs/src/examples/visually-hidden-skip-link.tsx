import { Link, Paragraph, Stack } from '@arun-dev/ui';

// Shown only while focused, so it can be styled as a visible pill when it appears.
const pill = {
  alignSelf: 'start',
  padding: 'var(--space-2xs) var(--space-sm)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-text-accent)',
  color: 'var(--color-text-on-accent)',
  textDecorationLine: 'none',
};

export default function VisuallyHiddenSkipLink() {
  return (
    <Stack gap="sm">
      <Link className="sr-only-focusable" href="#skip-demo-content" style={pill}>
        Skip to the demo content
      </Link>
      <Paragraph color="secondary">
        Click just above this text, then press Tab: the skip link appears while it has focus.
      </Paragraph>
      <Paragraph id="skip-demo-content" tabIndex={-1}>
        The content the link skips to.
      </Paragraph>
    </Stack>
  );
}
