import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from './chip';

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>React</Chip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('applies chip-default class by default', () => {
    render(<Chip>Tag</Chip>);
    const el = screen.getByText('Tag');
    expect(el).toHaveClass('chip', 'chip-default');
  });

  it('applies chip-accent class when variant is accent', () => {
    render(<Chip variant="accent">Tag</Chip>);
    const el = screen.getByText('Tag');
    expect(el).toHaveClass('chip', 'chip-accent');
  });

  it('merges additional className', () => {
    render(<Chip className="shrink-0">Tag</Chip>);
    expect(screen.getByText('Tag')).toHaveClass('shrink-0');
  });

  it('renders a span by default', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.getByText('Tag').tagName).toBe('SPAN');
  });

  it('renders the element given to `render`', () => {
    render(
      <ul>
        <Chip render={<li />}>React</Chip>
      </ul>,
    );
    const el = screen.getByText('React');
    expect(el.tagName).toBe('LI');
    expect(el).toHaveClass('chip', 'chip-default');
  });

  it('merges className onto the rendered element', () => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Chip's children
    const link = <a href="/tags/react" />;
    render(
      <Chip render={link} className="shrink-0" variant="accent">
        React
      </Chip>,
    );
    const el = screen.getByText('React');
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', '/tags/react');
    expect(el).toHaveClass('chip', 'chip-accent', 'shrink-0');
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Chip id="tag-react" aria-label="React tag" data-testid="chip">
        React
      </Chip>,
    );
    const el = screen.getByTestId('chip');
    expect(el).toHaveAttribute('id', 'tag-react');
    expect(el).toHaveAttribute('aria-label', 'React tag');
  });

  it('chains event handlers instead of replacing them', async () => {
    const calls: string[] = [];
    render(
      <Chip
        render={<button type="button" onClick={() => calls.push('render')} />}
        onClick={() => calls.push('own')}
      >
        Tag
      </Chip>,
    );
    screen.getByText('Tag').click();
    expect(calls).toEqual(['own', 'render']);
  });

  it('still supports the deprecated `as` prop', () => {
    render(<Chip as="button">Tag</Chip>);
    const el = screen.getByText('Tag');
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('type', 'button');
  });
});
