import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Paragraph } from './paragraph';

describe('Paragraph', () => {
  it('is a <p> that inherits size and colour by default', () => {
    render(<Paragraph>Body copy.</Paragraph>);
    const paragraph = screen.getByText('Body copy.');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph.className).toBe('paragraph');
  });

  it('maps size and colour onto the utility classes', () => {
    render(
      <Paragraph size="sm" color="secondary" className="mine">
        Small print.
      </Paragraph>,
    );
    expect(screen.getByText('Small print.').className).toBe(
      'paragraph text-size-sm text-color-secondary mine',
    );
  });

  it('renders another element through render', () => {
    render(<Paragraph render={<blockquote />}>Quoted.</Paragraph>);
    expect(screen.getByText('Quoted.').tagName).toBe('BLOCKQUOTE');
  });
});
