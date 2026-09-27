import { Textarea } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '24rem' };

export default function TextareaAutoResize() {
  return (
    <div style={field}>
      <label htmlFor="textarea-message">Message</label>
      {/* Type or paste a few paragraphs: it grows to --textarea-max-height, then scrolls. */}
      <Textarea id="textarea-message" autoResize placeholder="Type a few lines…" />
    </div>
  );
}
