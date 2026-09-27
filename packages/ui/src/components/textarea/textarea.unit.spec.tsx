import { createRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders a native textarea', () => {
    render(<Textarea aria-label="Bio" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('textarea');
  });

  it('renders no wrapper around the textarea', () => {
    const { container } = render(<Textarea aria-label="Bio" />);
    expect(container.firstElementChild).toBe(screen.getByRole('textbox'));
  });

  it('merges className onto the textarea', () => {
    render(<Textarea aria-label="Bio" className="w-64" />);
    expect(screen.getByRole('textbox')).toHaveClass('textarea', 'w-64');
  });

  it('spreads every other prop onto the textarea', () => {
    render(
      <Textarea
        aria-label="Bio"
        id="bio"
        name="bio"
        rows={6}
        maxLength={280}
        placeholder="Tell us about yourself"
        disabled
        aria-invalid
        data-testid="field"
      />,
    );
    const textarea = screen.getByTestId('field');
    expect(textarea).toHaveAttribute('id', 'bio');
    expect(textarea).toHaveAttribute('name', 'bio');
    expect(textarea).toHaveAttribute('rows', '6');
    expect(textarea).toHaveAttribute('maxlength', '280');
    expect(textarea).toHaveAttribute('placeholder', 'Tell us about yourself');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards ref to the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Bio" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('is uncontrolled by default and calls onChange', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Bio" defaultValue="Ada" onChange={onChange} />);
    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(textarea.value).toBe('Ada');
    fireEvent.change(textarea, { target: { value: 'Ada\nLovelace' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(textarea.value).toBe('Ada\nLovelace');
  });

  it('is controlled by value and onChange', () => {
    function Controlled() {
      const [bio, setBio] = useState('Ada');
      return (
        <>
          <Textarea aria-label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <button type="button" onClick={() => setBio('Reset by the app')}>
            Reset
          </button>
          <output>{bio.length}</output>
        </>
      );
    }
    render(<Controlled />);
    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(textarea.value).toBe('Ada');

    fireEvent.change(textarea, { target: { value: 'Ada\nLovelace' } });
    expect(textarea.value).toBe('Ada\nLovelace');
    expect(screen.getByRole('status')).toHaveTextContent('12');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(textarea.value).toBe('Reset by the app');
  });

  it('keeps the controlled value when onChange does not update it', () => {
    // Read the value inside the handler: React restores the DOM value right after it.
    const seen: string[] = [];
    render(<Textarea aria-label="Bio" value="Fixed" onChange={(e) => seen.push(e.target.value)} />);
    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');
    fireEvent.change(textarea, { target: { value: 'Typed' } });
    expect(seen).toEqual(['Typed']);
    expect(textarea.value).toBe('Fixed');
  });

  it('adds the auto-resize class only when asked', () => {
    const { rerender } = render(<Textarea aria-label="Bio" />);
    expect(screen.getByRole('textbox')).not.toHaveClass('textarea-auto-resize');
    rerender(<Textarea aria-label="Bio" autoResize />);
    expect(screen.getByRole('textbox')).toHaveClass('textarea', 'textarea-auto-resize');
  });

  it('does not leak autoResize onto the element', () => {
    render(<Textarea aria-label="Bio" autoResize />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('autoresize');
  });

  it('merges props and ref onto a `render` element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        aria-label="Notes"
        ref={ref}
        className="extra"
        render={<textarea data-custom="" spellCheck={false} />}
      />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea).toHaveAttribute('data-custom');
    expect(textarea).toHaveAttribute('spellcheck', 'false');
    expect(textarea).toHaveClass('textarea', 'extra');
    expect(ref.current).toBe(textarea);
  });
});
