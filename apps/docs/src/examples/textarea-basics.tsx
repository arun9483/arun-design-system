import { Textarea } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '24rem' };

export default function TextareaBasics() {
  return (
    <>
      <div style={field}>
        <label htmlFor="textarea-bio">Bio</label>
        <Textarea id="textarea-bio" rows={4} placeholder="A few lines about yourself" />
      </div>

      <div style={field}>
        <label htmlFor="textarea-reason">Reason for leaving</label>
        <Textarea id="textarea-reason" aria-invalid aria-describedby="textarea-reason-error" />
        <small id="textarea-reason-error" style={{ color: 'var(--color-status-error)' }}>
          Tell us why, so we can improve.
        </small>
      </div>

      <div style={field}>
        <label htmlFor="textarea-disabled">Disabled</label>
        <Textarea id="textarea-disabled" defaultValue="Read me, don't edit me" disabled />
      </div>
    </>
  );
}
