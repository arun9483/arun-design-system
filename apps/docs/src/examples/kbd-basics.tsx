import { Kbd } from '@arun-dev/ui';

export default function KbdBasics() {
  return (
    <p style={{ margin: 0 }}>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, <Kbd>Esc</Kbd> to close, and <Kbd>Shift</Kbd>{' '}
      <Kbd>Tab</Kbd> to go back.
    </p>
  );
}
